<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:resilientcommerce-handoff-log -->
# ResilientCommerce — Agent Handoff Log

This section is a running log for AI agents (Claude, Gemini, etc.) picking up this
project mid-stream. It records **what was done, why, and what's next**, so context
isn't lost when switching tools between sessions.

## Project goal

AetherMed (this repo) is being wrapped in production-grade DevOps infrastructure
as a portfolio project called **ResilientCommerce**. The narrative: prove the app
survives a booking-slot traffic spike (CoWIN-style rush), not build a new product.
The owner is a final-year CS student, working on Linux, cost-constrained (real
personal AWS account, no free-tier cushion — budget target for any live cloud demo
is under $2, spun up briefly and torn down, not run continuously).

Target stack (in order of build): Docker → local Kubernetes (Kind) → HPA/autoscaling
→ Prometheus/Grafana/Sentry/Jaeger monitoring → GitHub Actions CI/CD + Astra scan +
Codecov → ArgoCD GitOps → ConfigCat feature flags for canary → Terraform (tested
against LocalStack first) → k6 load test → one short real-AWS EKS demo → teardown.

## STEP 1 — Containerization (DONE, verified working)

### Files created/changed in this repo

1. **`next.config.ts`** — added `output: "standalone"`.
   **Why:** Without this, Next.js's Docker output includes the *entire*
   `node_modules` tree in the final image. `standalone` mode makes Next trace
   only the dependencies actually used at runtime and emit a minimal
   self-contained server bundle at `.next/standalone`. This is the single most
   important setting for a lean production image — skipping it was the most
   common mistake to avoid here.

2. **`Dockerfile`** (new) — 3-stage build: `deps` → `builder` → `runner`.
   - **Base image:** `node:22-alpine` for all stages (Next.js 16.2.9 + React 19
     require Node 20+; used 22 for headroom). Alpine keeps the final image small.
   - **`deps` stage:** installs dependencies via `npm ci` (uses the lockfile,
     not `npm install`, for reproducible builds). Includes
     `apk add libc6-compat openssl` — `openssl` is required by Prisma's query
     engine on Alpine, and `libc6-compat` helps native/prebuilt binaries (e.g.
     `sharp`, used for image optimization) behave correctly on musl libc instead
     of glibc.
   - **`builder` stage:** copies `node_modules` from `deps`, copies full source,
     then runs `npx prisma generate` **explicitly before** `npm run build`.
     **Why this matters:** this schema uses a *custom* Prisma client output path
     (`prisma/schema.prisma` → `generator client { output = "../app/generated/prisma" }`),
     not the default `node_modules/.prisma/client`. Next's build process does
     NOT auto-trigger `prisma generate` the way some default-path setups do via
     postinstall hooks, so this has to be a separate explicit `RUN` step or the
     build fails on missing generated types.
     A placeholder `DATABASE_URL` is injected via `ARG`/`ENV` at build time —
     real DB connectivity is NOT required at build time, only the variable's
     *presence*, because Next prerenders/type-checks routes that import the
     Prisma client.
   - **`runner` stage:** copies only `.next/standalone`, `.next/static`,
     `public/`, plus **two things that are easy to miss**:
     - `app/generated/prisma` — because it's a custom output path outside
       `node_modules`, Next's standalone file-tracing does not automatically
       include it. Must be copied in manually or the app crashes at runtime
       with a "cannot find module" error on the Prisma client.
     - `prisma/schema.prisma` — kept in case runtime migration commands are
       ever needed against this image.
     Runs as a **non-root user** (`nextjs`, uid 1001) — standard production
     security practice, and something worth calling out explicitly in any
     resume/interview description of this project.
     `CMD ["node", "server.js"]` — this is the entrypoint standalone mode
     generates automatically; do not use `next start` here, standalone builds
     don't use the normal CLI entrypoint.

3. **`.dockerignore`** (new) — excludes:
   - `.env` and all `.env*` files (secrets are injected at container runtime
     via `docker run -e` locally, and will be via Kubernetes Secrets /
     AWS Secrets Manager once deployed — never baked into the image).
   - `node_modules`, `.next`, `app/generated` (all regenerated inside the
     build; including them from the host would also risk copying
     host-OS-specific native binaries that don't match the Alpine container).
   - Real repo clutter found during inspection: `test*.ts`, `test*.js`,
     `scratch*.js`, several one-off Python refactor scripts
     (`refactor_admin.py`, `refactor_doctor.py`, `extract_clinics.py`,
     `fix_locations.py`), `CREDENTIALS.md`, and leftover SQLite files
     (`dev.db`, `prisma/dev.db` — the real datasource is Postgres via
     `DATABASE_URL`, these are stale local artifacts, not part of the app).

### Verified result
`docker build -t aethermed:local .` completes successfully (31 steps, no
errors). `docker run -p 3000:3000 -e DATABASE_URL=... -e NEXTAUTH_SECRET=... aethermed:local`
starts cleanly — Next.js reports "Ready" and serves on `localhost:3000`.

### Known gotchas already ruled out (don't waste time re-checking these)
- `sharp` built fine on Alpine — no need to add `python3 make g++` build tools.
- No Prisma binary-target mismatch — build and runtime both use the same
  Alpine/musl base image, so the engine generated in `builder` works in `runner`.
- No Turbopack flags anywhere in scripts — not a factor for this build (an
  earlier project note mentioned a Turbopack bug in local dev; irrelevant to
  this production Docker build path, which uses plain `next build`).

### ⚠️ Security note for whoever picks this up
Real `DATABASE_URL` (Neon Postgres connection string) and `NEXTAUTH_SECRET`
values have been exposed in a plaintext terminal screenshot during
development. These should be **rotated** (new Neon password, new
`NEXTAUTH_SECRET`) before this project is demoed publicly or the repo is made
public, even though `.env` itself was never committed.

## STEP 2 — Local Kubernetes (Kind) — DONE, verified working

- Kind v0.32.0 and kubectl v1.36.2 installed. Cluster created:
  `kind create cluster --name resilientcommerce`
- Image loading: Kind cannot see host Docker images automatically. Must run
  `kind load docker-image aethermed:local --name resilientcommerce` after
  every `docker build`, or pods fail with `ImagePullBackOff`.
- Manifests created in `k8s/`: `namespace.yaml`, `configmap.yaml`,
  `deployment.yaml`, `service.yaml`, `hpa.yaml`, `secret.example.yaml`
  (documentation only, real values never committed).
- **Real Secret is created imperatively, not from a committed file:**
  ```
  kubectl create secret generic aethermed-secrets --namespace resilientcommerce \
    --from-literal=DATABASE_URL='<real Neon URL>' \
    --from-literal=NEXTAUTH_SECRET='<real secret>'
  ```
  Must be ONE single line, no backslash line-continuations (they broke
  repeatedly when pasted into the terminal), and values in single quotes
  (the NEXTAUTH_SECRET contains a `!` which triggers bash history expansion
  if not single-quoted).
- Deployment resource requests: `cpu: 100m` (deliberately low — see load
  testing section below for why), limits `cpu: 500m`. HPA cannot function
  without `requests` being set — this is a hard prerequisite.
- Apply order matters: namespace → secret → configmap → deployment → service.
- Access locally via: `kubectl port-forward -n resilientcommerce svc/aethermed-service 3000:80`

### ⚠️ Mistake already made and fixed — don't repeat
Early on, `kubectl create secret` was run with the literal placeholder text
`your-real-neon-connection-string` instead of the actual value (copy-paste
error from an example command). This caused
`PrismaClientInitializationError: the URL must start with the protocol postgresql://`.
Always verify with:
```
kubectl get secret aethermed-secrets -n resilientcommerce -o jsonpath='{.data.DATABASE_URL}' | base64 -d
```
before assuming a secret is correct.

## STEP 3 — HPA + Load Testing — DONE, scaling verified working

- metrics-server installed (required, not bundled with Kind):
  ```
  kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
  kubectl patch deployment metrics-server -n kube-system --type='json' \
    -p='[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]'
  ```
  The `--kubelet-insecure-tls` patch is Kind-specific (Kind's internal certs
  aren't set up for strict verification). Without it, `kubectl top` and HPA
  both silently fail to get metrics.
- HPA config (`k8s/hpa.yaml`): min 2 / max 8 replicas, target 60% CPU
  utilization, fast scale-up (15s stabilization), slower scale-down (60s
  stabilization — deliberately slow so a scaled-up state is easier to catch
  on camera during a demo recording).

### Load test target — important lesson, don't waste time re-discovering this
First load-test attempt hit `/` (the homepage). Result: 0% CPU, p95=2.71ms,
HPA never moved. **The homepage is prerendered/static in Next.js standalone
mode — nearly free to serve, it will never generate enough load to trigger
CPU-based HPA.** Retargeted to `/api/slots` instead — a real Prisma-backed
route (queries Neon, computes slot availability). Used a real seeded clinic
name from `scripts/seed-credentials.js`: `MedPlus Healthcare Centre - Yeshwanthpur`
(URL-encoded) as the `clinicId` query param, plus today's date.

### Second issue found and fixed — Neon connection pool exhaustion
At 250 concurrent VUs with the default Prisma connection pool, requests
queued waiting for a DB connection rather than the app doing real CPU work:
p95 latency hit **18.89s**, CPU stayed at 0%. This is a genuinely useful
finding for the project narrative (bottleneck is the DB tier, not compute)
but needed tuning to get a demo-able scaling result:
- Added `&connection_limit=5&pool_timeout=10` to `DATABASE_URL` → over-corrected,
  latency dropped to 9.51s but was clearly hitting the pool_timeout ceiling
  (max latency 10.12s, right at the limit).
- Corrected to `&connection_limit=20&pool_timeout=15` → latency dropped to
  p95=2.73s, CPU finally climbed to 14%, **HPA scaled 2→3 replicas — first
  successful scaling event, confirmed via `kubectl get pods` showing a pod
  with a fresh ~78s age.**
- Load test VUs bumped from 50→150 (`k8s/load-test.js`) for a more decisive
  scaling demo. At 150 VUs, p95 rose to 7.2s (threshold technically "failed"
  in k6's red-text output) but 0% request failures, 100% success — this is
  fine, it's the system under real stress before HPA finishes compensating,
  not a broken test. Don't chase this number further; it's demo-realistic.
- **Current `k8s/load-test.js` stages: ramp to 50 (20s) → 150 (40s) → hold
  150 (40s) → ramp down (20s).** Current `DATABASE_URL` connection params:
  `connection_limit=20&pool_timeout=15`.

### Demo recording
Captured via GNOME's built-in recorder (Ctrl+Alt+Shift+R), 4 terminals
tiled: port-forward, `watch kubectl get hpa`, `watch kubectl get pods`, and
the `k6 run` command. Saved to `~/Videos`. This recording is the core
portfolio artifact for the autoscaling story — already captured successfully.

## STEP 4 — Monitoring (Prometheus + Grafana + Alertmanager) — IN PROGRESS

Installed via Helm (`kube-prometheus-stack`, installs all three at once):
```
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring --create-namespace
```
- Grafana admin password:
  `kubectl --namespace monitoring get secrets monitoring-grafana -o jsonpath="{.data.admin-password}" | base64 -d ; echo`
- **Important:** Grafana's default port-forward target (3000) collides with
  AetherMed's own port-forward. Use a different local port:
  `kubectl --namespace monitoring port-forward svc/monitoring-grafana 3001:80`
- Login username is literally `admin` (not an email) — a login failure
  happened once because an email got autofilled into the username field
  instead.
- **NOT YET DONE:** importing/building an actual dashboard showing AetherMed
  pod count, CPU, and request rate. This is the next immediate task.

## Ongoing housekeeping note — disk space
This machine runs low on disk repeatedly (Kind node image + Docker build
layers + 6 monitoring-stack images together are heavy). When space gets
tight:
```
docker image prune -a       # safe — only removes images not backing a running container
```
Also check `~/.local/share/Trash` periodically — files sent to Trash still
consume real disk space until emptied (`rm -rf ~/.local/share/Trash/files/*`).
Old snap revisions (`sudo snap set system refresh.retain=2` + removing
`disabled` revisions via `snap list --all`) are another recurring source of
reclaimable space on this machine specifically.

## NEXT UP
1. Grafana dashboard (pod count, CPU, request rate panels) — pick this up first.
2. GitHub Actions CI/CD pipeline (test → build → Astra scan → deploy) + Codecov.
3. ArgoCD GitOps.
4. Sentry (app-level error tracking) + Jaeger (tracing).
5. ConfigCat feature flags for canary deployment.
6. Terraform (VPC/EKS/ALB/NAT Gateway), tested against LocalStack before any real AWS spend.
7. One short real-AWS EKS demo session (~$1.50 budget), then `terraform destroy`.
<!-- END:resilientcommerce-handoff-log -->
