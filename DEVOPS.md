# ResilientCommerce — DevOps/SRE Infrastructure for AetherMed

A production-grade DevOps wrapper around AetherMed (a Next.js clinic
booking app), built to demonstrate how the app survives a CoWIN-style
traffic spike — on a personal laptop, local Kubernetes cluster, and a
real (non-free-tier) AWS account.

## Architecture

[Insert diagram]

## Stack

- **Containers:** Docker (multi-stage, node:22-alpine)
- **Orchestration:** Kind (local), HPA (2–8 replicas, 60% CPU target)
- **GitOps:** ArgoCD — auto-sync + self-heal from `k8s/` on `main`
- **CI/CD:** GitHub Actions — test → Docker build → Trivy scan → Codecov
- **Observability:** Prometheus + Grafana, Sentry (errors/APM/replay), Jaeger (tracing)
- **IaC:** Terraform (VPC, EKS, ALB, NAT) — validated on LocalStack, deployed to real AWS
- **Feature flags:** ConfigCat — live toggle without redeploy
- **Load testing:** k6

## What this proves

1. **Autoscaling under load** — HPA scaled 2→N replicas under k6 load on `/api/slots`.
2. **A real bug, found and fixed** — Neon connection-pool exhaustion under load;
   fixed via `connection_limit=20&pool_timeout=15`.
3. **A silent observability bug, found and fixed** — Sentry's OpenTelemetry
   auto-instrumentation silently blocked a second OTel `NodeSDK` from
   registering. Root-caused via OTel diagnostic logging; fixed by reordering
   SDK init and `skipOpenTelemetrySetup: true`.
4. **GitOps in practice** — ArgoCD Healthy/Synced, auto-deploying from `main`.
5. **Real cloud provisioning, done responsibly** — Terraform applied a full
   VPC/EKS/ALB/NAT stack to real AWS, verified via console + CLI, then fully
   torn down (`terraform destroy` + manual VPC endpoint cleanup) — ~$0.03 spend.
6. **Feature flags without redeploy** — ConfigCat flag toggled live at
   `/feature-demo`, reflected within a 10s poll interval.

## Demo recordings

- [Autoscaling under load (HPA + Grafana)](YOUR_LINK_HERE)
- [Real AWS EKS provisioning + teardown via Terraform](YOUR_LINK_HERE)

## Cost decisions

- Local Kind cluster for all dev/testing — zero cost
- LocalStack Pro (via GitHub Student Pack) validated all Terraform before real AWS
- Real AWS EKS session time-boxed, ~$0.03 actual spend, destroyed immediately after
- No AWS free-tier available (account created post-July-2025 policy change)

## What's not implemented

- Blue-green/canary deployment automation — deprioritized given time constraints
