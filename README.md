<div align="center">

# 🩺 AetherMed × ⚡ ResilientCommerce

### A clinic booking platform, plus the DevOps setup that keeps it running through a booking rush.

*Built and tested to survive a **CoWIN-style traffic spike**, when everyone hits "Book Now" the moment slots open.*

<br/>

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Neon_Postgres-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)
![ArgoCD](https://img.shields.io/badge/ArgoCD-EF7B4D?style=for-the-badge&logo=argo&logoColor=white)
![Terraform](https://img.shields.io/badge/Terraform-7B42BC?style=for-the-badge&logo=terraform&logoColor=white)
![AWS](https://img.shields.io/badge/AWS_EKS-232F3E?style=for-the-badge&logo=amazonwebservices&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)

![Prometheus](https://img.shields.io/badge/Prometheus-E6522C?style=for-the-badge&logo=prometheus&logoColor=white)
![Grafana](https://img.shields.io/badge/Grafana-F46800?style=for-the-badge&logo=grafana&logoColor=white)
![Sentry](https://img.shields.io/badge/Sentry-362D59?style=for-the-badge&logo=sentry&logoColor=white)
![Jaeger](https://img.shields.io/badge/Jaeger-66CFE3?style=for-the-badge&logo=jaeger&logoColor=black)
![k6](https://img.shields.io/badge/k6-7D64FF?style=for-the-badge&logo=k6&logoColor=white)

<br/>

[✨ Features](#-features) •
[🏗️ Architecture](#️-architecture) •
[🚀 Quick Start](#-quick-start) •
[☸️ Kubernetes](#️-kubernetes-deployment) •
[📈 Load Testing](#-load-testing--autoscaling) •
[🔭 Observability](#-observability) •
[☁️ Terraform](#️-infrastructure-as-code) •
[🧠 Lessons](#-war-stories--lessons-learned)

</div>

---

## 📖 Overview

The project has two layers:

| Layer | What it is |
|---|---|
| **🩺 AetherMed** | A full-stack **clinic booking and management platform** built with Next.js (App Router), Prisma, and Postgres. It has separate portals for patients, doctors, and admins, live slot availability, telemedicine bookings, health records, and an AI booking assistant that speaks English, ಕನ್ನಡ, and हिन्दी. |
| **⚡ ResilientCommerce** | The **DevOps and SRE setup around it**: Docker, Kubernetes with autoscaling, GitOps, CI/CD, monitoring and tracing, feature flags, and Terraform-managed AWS infrastructure. Its job is to show that the app holds up under a real booking rush. |

> 💡 **The goal isn't to build another booking app.** The goal is to show that this one **scales out, stays up, and can be observed** when demand jumps.

---

## ✨ Features

### 🩺 Application

<table>
<tr>
<td width="50%" valign="top">

**👤 Patient Portal**
- Book in-person or 📹 **telemedicine** consultations
- Real-time **slot availability** per clinic and date
- Booking history and queue **token** tracking
- Personal **health records** and prescriptions
- In-app notifications

</td>
<td width="50%" valign="top">

**🧑‍⚕️ Doctor / Clinic Portal**
- Live **active bookings** queue (Pending → In Cabin → Processed)
- **Process visits**: diagnosis, prescriptions, and fees
- **Leave and unavailability** management (full day or partial)
- **Staff and intern roster** management
- Configurable **slot schedules** (hours, lunch break, duration, capacity)

</td>
</tr>
<tr>
<td width="50%" valign="top">

**🛡️ Admin Console**
- Network-wide view across clinics
- Filter by care type: Allopathy · Ayurveda · Homeopathy · Veterinary
- Role-protected via middleware and NextAuth JWT

</td>
<td width="50%" valign="top">

**🤖 AI Engine Bot & UX**
- A conversational **booking assistant** that walks you through service, specialty, location, clinic, date, and time
- 🌐 **Trilingual**: English · Kannada · Hindi
- 🗺️ Clinic **locations** directory
- 🌌 3D ambient scenes built with **React Three Fiber**
- 📊 Charts powered by **Recharts**

</td>
</tr>
</table>

### ⚡ Platform & Infrastructure

| | Capability | Implementation |
|---|---|---|
| 🐳 | **Containerization** | 3-stage Docker build on `node:22-alpine`, Next.js `standalone` output, runs as a non-root user |
| ☸️ | **Orchestration** | Kubernetes (Kind locally, EKS on AWS) with readiness and liveness probes |
| 📈 | **Autoscaling** | HPA scales **2 → 8 replicas** at 60% CPU, with fast scale-up and slower scale-down |
| 🔁 | **GitOps** | ArgoCD with auto-sync, prune, and self-heal from `k8s/` on `main` |
| 🧪 | **CI/CD** | GitHub Actions: install → test → Codecov → Docker build → **Trivy** security scan |
| 🔭 | **Observability** | Prometheus + Grafana + Alertmanager, **Sentry** (errors, APM, replay), **Jaeger** via OpenTelemetry |
| 🚩 | **Feature Flags** | **ConfigCat** flags toggled live without a redeploy (10s poll) |
| ☁️ | **IaC** | Terraform for VPC, subnets, NAT, EKS, and ALB, validated on **LocalStack** before it touches real AWS |
| 🏋️ | **Load Testing** | **k6** script that simulates the slot-opening rush on `/api/slots` |

---

## 🏗️ Architecture

```mermaid
flowchart LR
    subgraph Dev["👩‍💻 Developer"]
        Code[Git push to main]
    end

    subgraph CI["🧪 GitHub Actions"]
        direction TB
        T[npm ci + tests] --> CC[Codecov]
        CC --> DB[Docker Buildx]
        DB --> TR[Trivy scan]
    end

    subgraph K8s["☸️ Kubernetes · ns: resilientcommerce"]
        direction TB
        SVC[Service :80] --> P1[Pod]
        SVC --> P2[Pod]
        SVC --> P3[Pod ...n]
        HPA[HPA 2→8 @ 60% CPU] -. scales .-> P1
    end

    subgraph Obs["🔭 Observability"]
        PROM[Prometheus] --> GRAF[Grafana]
        JAE[Jaeger]
        SEN[Sentry]
    end

    Code --> CI
    Code --> ARGO[🔁 ArgoCD] -->|auto-sync| K8s
    Users((👥 Patients<br/>k6 rush)) --> SVC
    K8s -->|Prisma| NEON[(🐘 Neon Postgres)]
    K8s -->|OTLP traces| JAE
    K8s -->|errors| SEN
    PROM -. scrapes .-> K8s
    K8s <-->|flags| CFG[🚩 ConfigCat]
```

### ☁️ AWS Target (Terraform)

```mermaid
flowchart TB
    Internet((🌐 Internet)) --> ALB[Application Load Balancer]
    subgraph VPC["VPC 10.0.0.0/16 · us-east-1a / 1b"]
        subgraph Public["Public subnets"]
            ALB
            NAT[NAT Gateway + EIP]
        end
        subgraph Private["Private subnets"]
            EKS[EKS Cluster<br/>resilientcommerce-eks]
        end
        IGW[Internet Gateway]
    end
    ALB --> EKS
    EKS --> NAT --> IGW --> Internet
```

---

## 🧰 Tech Stack

<details open>
<summary><b>Application</b></summary>

| Area | Tech |
|---|---|
| Framework | Next.js **16.2** (App Router, standalone output) |
| UI | React **19**, Tailwind CSS **v4**, React Three Fiber / Drei / Cannon, Recharts |
| Auth | NextAuth v4 (JWT, role-based: `patient` · `doctor` · `admin`) |
| Data | Prisma **6** ORM → PostgreSQL (Neon serverless) |
| Realtime | socket.io-client |
| Language | TypeScript 5 |

</details>

<details>
<summary><b>DevOps / SRE</b></summary>

| Area | Tech |
|---|---|
| Containers | Docker (multi-stage, Alpine) |
| Orchestration | Kubernetes · Kind · AWS EKS |
| Scaling | HorizontalPodAutoscaler + metrics-server |
| GitOps | ArgoCD |
| CI/CD | GitHub Actions · Trivy · Codecov |
| Monitoring | kube-prometheus-stack (Prometheus, Grafana, Alertmanager) |
| Errors / APM | Sentry (`@sentry/nextjs`) |
| Tracing | OpenTelemetry Node SDK → Jaeger (OTLP/HTTP) |
| Feature flags | ConfigCat |
| IaC | Terraform (AWS provider ~> 5.0) · LocalStack |
| Load testing | k6 |

</details>

---

## 📂 Project Structure

```text
Aethermed/
├── app/                        # Next.js App Router
│   ├── api/                    # Route handlers (REST)
│   │   ├── auth/               #   NextAuth + credential verification
│   │   ├── bookings/           #   GET / POST / PATCH bookings
│   │   ├── slots/              #   Slot availability + slot config
│   │   ├── doctor/leave/       #   Doctor leave management
│   │   ├── health-records/     #   Patient health records
│   │   └── patient/dashboard/  #   Patient dashboard aggregate
│   ├── admin/  doctor/  patient/   # Role-specific portals (+ /auth pages)
│   ├── home/  locations/       # Public pages
│   ├── feature-demo/           # Live ConfigCat flag demo
│   ├── components/             # Navbar, Footer, AIEngineBot, 3D Scene, Toasts
│   ├── context/                # Auth, Language (en/kn/hi), Aether state
│   ├── data/clinics.ts         # Clinic directory
│   └── lib/                    # prisma client, auth options, timezone utils
├── lib/featureFlags.ts         # ConfigCat client wrapper
├── prisma/schema.prisma        # Data model
├── k8s/                        # Kubernetes manifests + k6 load test + ArgoCD app
├── terraform/                  # IaC targeting LocalStack (dry run)
├── terraform-aws/              # Same IaC targeting real AWS
├── .github/workflows/ci.yml    # CI pipeline
├── instrumentation.ts          # OpenTelemetry + Sentry bootstrap
├── middleware.ts               # Role-based route protection
├── Dockerfile                  # 3-stage production image
└── DEVOPS.md                   # Infra write-up
```

---

## 🗄️ Data Model

```mermaid
erDiagram
    USER ||--o{ BOOKING : "books (patient)"
    USER ||--o{ BOOKING : "handles (staff)"
    USER ||--o{ HEALTH_RECORD : owns
    USER ||--o{ DOCTOR_LEAVE : takes
    USER ||--o{ NOTIFICATION : receives
    CLINIC ||--o{ USER : employs
    CLINIC ||--o{ BOOKING : hosts
    CLINIC ||--o| SLOT_CONFIG : configures
    CLINIC ||--o{ DOCTOR_LEAVE : tracks
    BOOKING ||--o| HEALTH_RECORD : produces
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 20+** (22 recommended)
- A **PostgreSQL** database (e.g. a free [Neon](https://neon.tech) project)
- *(optional)* Docker, Kind, kubectl, Helm, k6, Terraform

### 1️⃣ Clone and install

```bash
git clone https://github.com/likith1231/Aethermed.git
cd Aethermed
npm install
```

### 2️⃣ Configure environment

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require&connection_limit=20&pool_timeout=15"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# Optional integrations
CONFIGCAT_SDK_KEY="your-configcat-sdk-key"
OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318/v1/traces"
```

> 🔐 `.env` files are git-ignored and excluded from the Docker build context. **Never commit real secrets.**

### 3️⃣ Set up the database

```bash
npx prisma generate      # generates the client into app/generated/prisma
npx prisma db push       # syncs the schema to your database
```

### 4️⃣ Run it

```bash
npm run dev              # → http://localhost:3000
```

| Script | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (standalone) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

---

## 🐳 Docker

```bash
docker build -t aethermed:local .

docker run -p 3000:3000 \
  -e DATABASE_URL='postgresql://...' \
  -e NEXTAUTH_SECRET='...' \
  aethermed:local
```

<details>
<summary><b>🔍 How the image is built (3 stages)</b></summary>

| Stage | What it does |
|---|---|
| **deps** | `npm ci` on `node:22-alpine` with `libc6-compat` + `openssl` (Prisma engine and `sharp` on musl) |
| **builder** | Runs `prisma generate` **explicitly** (the client lives at a custom output path), then `next build` with a placeholder `DATABASE_URL` |
| **runner** | Copies only `.next/standalone`, `.next/static`, `public/`, plus `app/generated/prisma`, which standalone tracing misses. Runs as non-root `nextjs` (uid 1001) with `node server.js` |

</details>

---

## ☸️ Kubernetes Deployment

```bash
# 1. Cluster + image
kind create cluster --name resilientcommerce
kind load docker-image aethermed:local --name resilientcommerce   # after every build

# 2. Namespace and secret (created imperatively, never committed)
kubectl apply -f k8s/namespace.yaml
kubectl create secret generic aethermed-secrets -n resilientcommerce --from-literal=DATABASE_URL='postgresql://...' --from-literal=NEXTAUTH_SECRET='...'

# 3. App
kubectl apply -f k8s/configmap.yaml -f k8s/deployment.yaml -f k8s/service.yaml -f k8s/hpa.yaml

# 4. Metrics server (required for HPA; the patch is Kind-specific)
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
kubectl patch deployment metrics-server -n kube-system --type='json' \
  -p='[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]'

# 5. Access
kubectl port-forward -n resilientcommerce svc/aethermed-service 3000:80
```

### 🔁 GitOps with ArgoCD

```bash
kubectl apply -f k8s/argocd-app.yaml
```

ArgoCD watches `k8s/` on `main`, with **automated sync, prune, and self-heal** turned on. A push to `main` gets deployed, and manual drift in the cluster gets reverted.

---

## 📈 Load Testing & Autoscaling

```bash
k6 run k8s/load-test.js
```

The script models the **"slots just opened"** rush against the Prisma-backed `/api/slots` endpoint:

```text
VUs
150 ┤            ╭──────────────╮
    │           ╱                ╲
 50 ┤     ╭────╯                  ╲
    │    ╱                         ╲
  0 ┼───╯                           ╰───
    0s   20s        60s        100s  120s
       ramp     sustained     hold   cool-down
```

| HPA setting | Value | Why |
|---|---|---|
| Replicas | **2 → 8** | Keeps high availability at the floor and bounds cost at the ceiling |
| Target | **60% CPU** of `requests.cpu` (150m) | Low enough to trigger visibly in a demo |
| Scale-up | +2 pods / 15s, 15s window | Reacts quickly to a spike |
| Scale-down | −1 pod / 30s, 60s window | Avoids flapping and keeps the scaled state visible |

**Watch it scale live:**

```bash
watch kubectl get hpa  -n resilientcommerce
watch kubectl get pods -n resilientcommerce
```

---

## 🔭 Observability

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install monitoring prometheus-community/kube-prometheus-stack -n monitoring --create-namespace

# Grafana on :3001 (3000 is taken by the app)
kubectl -n monitoring port-forward svc/monitoring-grafana 3001:80
kubectl -n monitoring get secrets monitoring-grafana -o jsonpath="{.data.admin-password}" | base64 -d; echo
```

| Signal | Tool | Wiring |
|---|---|---|
| 📊 Metrics | Prometheus → Grafana | kube-prometheus-stack, pod CPU / replica count |
| 🐞 Errors & APM | Sentry | `sentry.*.config.ts`, `global-error.tsx`, `withSentryConfig` |
| 🧵 Traces | OpenTelemetry → Jaeger | `instrumentation.ts`: NodeSDK + auto-instrumentations → OTLP/HTTP |
| 🚩 Flags | ConfigCat | `lib/featureFlags.ts`, demo at `/feature-demo` |

---

## ☁️ Infrastructure as Code

Two identical Terraform stacks:

| Folder | Target | Purpose |
|---|---|---|
| `terraform/` | **LocalStack** (`localhost:4566`) | Free dry run: validate everything before spending money |
| `terraform-aws/` | **Real AWS** (`us-east-1`) | Short, time-boxed live demo |

**Resources:** VPC · 2× public + 2× private subnets · Internet Gateway · NAT Gateway + EIP · route tables · EKS cluster + IAM role · ALB + security group.

```bash
cd terraform-aws
terraform init
terraform plan
terraform apply      # ⏱️ demo quickly…
terraform destroy    # 💸 …and tear it down right away
```

> 💰 **Cost discipline:** all development runs on a local Kind cluster for $0. The real EKS session was time-boxed and destroyed immediately, for about **$0.03** in actual spend.

---

## 🧠 War Stories & Lessons Learned

<details>
<summary><b>🏠 1. The homepage never triggers autoscaling</b></summary>

The first load test hit `/`. Result: **0% CPU, p95 = 2.71ms, the HPA never moved.** In standalone mode the homepage is prerendered and costs almost nothing to serve. Pointing the test at the database-backed `/api/slots` route produced real load.

</details>

<details>
<summary><b>🐘 2. The bottleneck was the database, not compute</b></summary>

At 250 VUs with Prisma's default pool, requests queued waiting for a DB connection: **p95 = 18.89s at 0% CPU.**

| Pool settings | p95 latency | Outcome |
|---|---|---|
| default | 18.89s | Pool exhaustion |
| `connection_limit=5&pool_timeout=10` | 9.51s | Over-corrected; requests hit the timeout ceiling |
| `connection_limit=20&pool_timeout=15` | **2.73s** | CPU climbed and the **HPA scaled 2 → 3** ✅ |

</details>

<details>
<summary><b>🔇 3. A silent observability bug</b></summary>

Sentry's own OpenTelemetry setup silently stopped a second OTel `NodeSDK` from registering, so no traces reached Jaeger and no error was raised. OTel diagnostic logging traced it to the cause. The fix was to start the OTel SDK **first** and let Sentry attach to it with `skipOpenTelemetrySetup: true`.

</details>

<details>
<summary><b>📦 4. Prisma + standalone + custom output path</b></summary>

The Prisma client is generated into `app/generated/prisma`, not `node_modules`. That means `next build` doesn't generate it automatically, and standalone file tracing doesn't copy it. Both steps are handled explicitly in the Dockerfile; otherwise the container crashes with *"cannot find module"*.

</details>

---

## 🗺️ Roadmap

- [x] Multi-stage Docker image
- [x] Local Kubernetes (Kind) + HPA autoscaling
- [x] k6 load testing + DB pool tuning
- [x] Prometheus / Grafana / Alertmanager
- [x] Sentry + OpenTelemetry → Jaeger
- [x] GitHub Actions CI + Trivy + Codecov
- [x] ArgoCD GitOps
- [x] ConfigCat feature flags
- [x] Terraform (LocalStack → real AWS EKS → destroy)
- [ ] Automated canary / blue-green rollouts
- [ ] Real unit and integration test suite in CI
- [ ] Push images to a registry (ECR/GHCR) and deploy to EKS from CI

---

## 🔐 Security Notes

- Secrets are **injected at runtime** (Kubernetes Secrets / `docker run -e`). They are never baked into images or committed to git.
- Containers run as a **non-root** user.
- Every CI build runs a **Trivy** scan on the image (OS and library CVEs).
- Admin and doctor routes are protected by **role-checked JWT middleware**.

---

<div align="center">

**Made with ☕, `kubectl`, and a strict cloud budget.**

⭐ If you found this useful, consider starring the repo!

</div>
