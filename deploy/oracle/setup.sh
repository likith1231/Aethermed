#!/usr/bin/env bash
# Deploys AetherMed (with the ResilientCommerce Kubernetes setup) to a single Oracle Cloud VM:
# k3s, the k8s/ manifests (HPA included), optional ArgoCD, and HTTPS through the VM's Caddy.
#
# Usage (on the VM, from the repo root):
#   cp deploy/oracle/oracle.env.example deploy/oracle/oracle.env && nano deploy/oracle/oracle.env
#   bash deploy/oracle/setup.sh
# Re-run it any time to rebuild and roll out the latest code.
set -euo pipefail
cd "$(dirname "$0")/../.."

say() { printf '\n==> %s\n' "$*"; }
die() { printf '\nERROR: %s\n' "$*" >&2; exit 1; }

ENV_FILE=deploy/oracle/oracle.env
[ -f "$ENV_FILE" ] || die "Missing $ENV_FILE. Run: cp deploy/oracle/oracle.env.example $ENV_FILE && nano $ENV_FILE"
set -a; . "$ENV_FILE"; set +a
[ -n "${DATABASE_URL:-}" ] || die "Set DATABASE_URL (your Neon connection string) in $ENV_FILE"
command -v docker >/dev/null || die "Docker is not installed. Run the Orbit IDE setup first (deploy/setup-oracle.sh)."

# ---------------------------------------------------------------- k3s (shared by all projects)
ensure_k3s() {
  if ! command -v k3s >/dev/null; then
    say "Installing k3s (lightweight Kubernetes)"
    # Traefik is disabled: Caddy already owns ports 80/443 on this VM.
    curl -sfL https://get.k3s.io | sudo INSTALL_K3S_EXEC="--disable traefik" sh -
  fi
  # Oracle's Ubuntu image rejects all inbound traffic except SSH, which also blocks pods
  # talking to the node (kubelet, metrics-server, host services). Allow the pod/service CIDRs.
  sudo tee /etc/systemd/system/k3s-oracle-firewall.service >/dev/null <<'UNIT'
[Unit]
Description=Allow k3s pod and service networks through the Oracle iptables rules
After=network-online.target
Before=k3s.service

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/bin/sh -c 'for net in 10.42.0.0/16 10.43.0.0/16; do \
  iptables -C INPUT -s $net -j ACCEPT 2>/dev/null || iptables -I INPUT 1 -s $net -j ACCEPT; \
  iptables -C FORWARD -s $net -j ACCEPT 2>/dev/null || iptables -I FORWARD 1 -s $net -j ACCEPT; \
  iptables -C FORWARD -d $net -j ACCEPT 2>/dev/null || iptables -I FORWARD 1 -d $net -j ACCEPT; done'

[Install]
WantedBy=multi-user.target
UNIT
  sudo systemctl daemon-reload
  sudo systemctl enable --now k3s-oracle-firewall.service >/dev/null
  mkdir -p "$HOME/.kube"
  sudo cat /etc/rancher/k3s/k3s.yaml > "$HOME/.kube/config"
  chmod 600 "$HOME/.kube/config"
  export KUBECONFIG="$HOME/.kube/config"
  for _ in $(seq 1 60); do kubectl get nodes 2>/dev/null | grep -q ' Ready' && return; sleep 2; done
  die "k3s did not become ready. Check: sudo journalctl -u k3s -n 50"
}

base_domain() {
  if [ -n "${BASE_DOMAIN:-}" ]; then echo "$BASE_DOMAIN"; return; fi
  local ip
  ip=$(curl -fsS --max-time 5 https://api.ipify.org || curl -fsS --max-time 5 https://ifconfig.me)
  [ -n "$ip" ] || die "Could not detect the public IP. Set BASE_DOMAIN in $ENV_FILE"
  echo "${ip//./-}.sslip.io"
}

# Adds a site to the VM's Caddy (run by the Orbit IDE stack) and reloads it.
caddy_site() {
  local name=$1 body=$2
  sudo mkdir -p /etc/caddy-sites
  printf '%s\n' "$body" | sudo tee "/etc/caddy-sites/$name.caddy" >/dev/null
  local caddy
  caddy=$(docker ps --format '{{.Names}}' | grep -m1 caddy || true)
  if [ -n "$caddy" ]; then
    docker exec "$caddy" caddy reload --config /etc/caddy/Caddyfile >/dev/null \
      || echo "   (Caddy reload failed; check: docker logs $caddy)"
  else
    echo "   Caddy is not running yet. Start the Orbit IDE stack and this site will be served."
  fi
}

ensure_k3s
DOMAIN_BASE=$(base_domain)
APP_HOST="aethermed.$DOMAIN_BASE"
NS=resilientcommerce

say "Building the AetherMed image (first build takes a few minutes)"
docker build -t aethermed:local .
say "Loading the image into k3s"
docker save aethermed:local | sudo k3s ctr images import - >/dev/null

say "Creating namespace and secrets"
kubectl apply -f k8s/namespace.yaml
# Values in the Secret override the ConfigMap (envFrom order), so NEXTAUTH_URL points at this host.
NEXTAUTH_SECRET=${NEXTAUTH_SECRET:-$(sudo cat /var/lib/aethermed-nextauth-secret 2>/dev/null || true)}
if [ -z "$NEXTAUTH_SECRET" ]; then
  NEXTAUTH_SECRET=$(openssl rand -hex 32)
  echo "$NEXTAUTH_SECRET" | sudo tee /var/lib/aethermed-nextauth-secret >/dev/null
  sudo chmod 600 /var/lib/aethermed-nextauth-secret
fi
kubectl -n "$NS" create secret generic aethermed-secrets \
  --from-literal=DATABASE_URL="$DATABASE_URL" \
  --from-literal=NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
  --from-literal=NEXTAUTH_URL="https://$APP_HOST" \
  --from-literal=CONFIGCAT_SDK_KEY="${CONFIGCAT_SDK_KEY:-}" \
  --dry-run=client -o yaml | kubectl apply -f -

MEM_GB=$(awk '/MemTotal/{print int($2/1048576)}' /proc/meminfo)
if [ "${ARGOCD:-auto}" = "true" ] || { [ "${ARGOCD:-auto}" = "auto" ] && [ "$MEM_GB" -ge 11 ]; }; then
  say "Installing ArgoCD (GitOps: the cluster follows k8s/ on the main branch)"
  kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
  kubectl apply -n argocd --server-side --force-conflicts \
    -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml >/dev/null
  kubectl -n argocd rollout status deploy/argocd-server --timeout=300s
  kubectl -n argocd rollout status deploy/argocd-repo-server --timeout=300s
  kubectl apply -f k8s/argocd-app.yaml
  for _ in $(seq 1 60); do kubectl -n "$NS" get deploy/aethermed >/dev/null 2>&1 && break; sleep 5; done
else
  say "Applying the Kubernetes manifests (ArgoCD skipped: ${MEM_GB} GB RAM; set ARGOCD=true to force)"
  kubectl apply -f k8s/configmap.yaml -f k8s/deployment.yaml -f k8s/service.yaml -f k8s/hpa.yaml
fi
kubectl apply -f deploy/oracle/edge-service.yaml

say "Rolling out"
kubectl -n "$NS" rollout restart deploy/aethermed
kubectl -n "$NS" rollout status deploy/aethermed --timeout=600s

say "Publishing https://$APP_HOST"
caddy_site aethermed "$APP_HOST {
	encode zstd gzip
	reverse_proxy 127.0.0.1:30300
}"

cat <<EOF

AetherMed is running:   https://$APP_HOST
  (the first visit can take ~20 s while the HTTPS certificate is issued)

Useful commands:
  kubectl -n $NS get pods,hpa          # pods and autoscaler
  kubectl -n $NS logs deploy/aethermed # app logs
  bash deploy/oracle/setup.sh          # rebuild and redeploy after a git pull
EOF
if kubectl get ns argocd >/dev/null 2>&1; then
  echo "  ArgoCD UI (from your laptop): ssh -L 8443:127.0.0.1:8443 ubuntu@<VM_IP>"
  echo "    then on the VM: kubectl -n argocd port-forward svc/argocd-server 8443:443"
  echo "    login: admin / $(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' 2>/dev/null | base64 -d)"
fi
