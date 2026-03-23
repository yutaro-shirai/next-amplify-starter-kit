# Getting Started

[日本語 (Japanese)](getting-started.ja.md)

## TL;DR

```bash
git clone https://github.com/i-Willink-LLC/next-amplify-starter-kit.git
cd next-amplify-starter-kit
pnpm install
pnpm dev
```

Open http://localhost:3000. That's it.

---

## Step-by-Step Guide

### 1. Prerequisites

| Tool | Required | Install |
|------|----------|---------|
| **Node.js** 18.17+ | Yes | [nodejs.org](https://nodejs.org/) or `nvm install 20` |
| **pnpm** 8+ | Yes | `corepack enable` (bundled with Node.js 16.13+) |
| **Git** | Yes | [git-scm.com](https://git-scm.com/) |
| **Docker** | Optional | Only needed for [Devcontainer](./devcontainer-guide.md) |

### 2. Clone & Install

```bash
git clone https://github.com/i-Willink-LLC/next-amplify-starter-kit.git
cd next-amplify-starter-kit
pnpm install
```

### 3. Start the Dev Server

```bash
pnpm dev
```

Open http://localhost:3000 in your browser. You should see the landing page.

### 4. Explore the App

| Route | Description |
|-------|-------------|
| `/` | Landing page with feature cards |
| `/contact` | Sample contact form (SES email demo) |

### 5. Run Tests

```bash
pnpm test          # Unit tests (Vitest)
```

### 6. Check Code Quality

```bash
pnpm lint           # ESLint
pnpm format         # Prettier auto-format
```

---

## Project Structure

```
next-amplify-starter-kit/
├── apps/web/              # Next.js 15 application (App Router)
├── packages/
│   ├── tsconfig/          # Shared TypeScript config
│   └── eslint-config/     # Shared ESLint config
├── infra/                 # AWS CDK infrastructure (TypeScript)
├── docs/                  # Documentation
└── .github/workflows/     # CI/CD pipeline
```

| Directory | What's inside |
|-----------|---------------|
| `apps/web/src/app/` | Pages and API routes (Next.js App Router) |
| `apps/web/src/lib/` | Shared utilities (SES client, etc.) |
| `apps/web/src/__tests__/` | Unit tests (Vitest) |
| `infra/lib/` | CDK stacks — Amplify hosting, SES email |
| `infra/bin/app.ts` | CDK entry point |
| `docs/` | Project docs, dev guides, operations guides |

---

## Environment Variables

### Frontend (`apps/web/.env.local`) — Optional

| Variable | Required | Description |
|----------|----------|-------------|
| `SES_FROM_EMAIL` | For contact form | Verified sender email in SES |
| `SES_TO_EMAIL` | For contact form | Recipient email for form submissions |
| `SES_REGION` | No | AWS region for SES (default: `ap-northeast-1`) |

> The app runs without any env vars. SES variables are only needed if you want the contact form to actually send emails.

### Infrastructure (`infra/.env`) — For AWS Deployment

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AWS_ACCESS_KEY_ID` | Yes | — | IAM access key |
| `AWS_SECRET_ACCESS_KEY` | Yes | — | IAM secret key |
| `AWS_DEFAULT_REGION` | No | `ap-northeast-1` | AWS region |
| `REPO_NAME` | Yes | — | GitHub repository name |
| `AMPLIFY_APP_NAME` | Yes | — | Amplify app name |
| `GITHUB_TOKEN` | Conditional | — | Required if `USE_SECRETS_MANAGER=false` |
| `USE_SECRETS_MANAGER` | No | `true` | Set `false` to use env var token instead |
| `DOMAIN_NAME` | No | — | Custom domain (Route53) |
| `SES_FROM_EMAIL` | No | — | Enable SES stack |
| `SES_DOMAIN` | No | — | Domain-level SES verification |
| `ROUTE53_HOSTED_ZONE_ID` | No | — | Auto-create DKIM records |

To get started with deployment:

```bash
cp infra/.env.example infra/.env
# Edit infra/.env with your AWS credentials
cd infra && npx cdk deploy
```

See the [Deployment Guide](../30_operations/deployment.md) for full instructions.

---

## Troubleshooting

### `pnpm: command not found`

pnpm is bundled with Node.js via Corepack:

```bash
corepack enable
```

### Port 3000 already in use

```bash
# Find and kill the process
lsof -i :3000    # macOS/Linux
netstat -ano | findstr :3000   # Windows

# Or use a different port
PORT=3001 pnpm dev
```

### Node.js version mismatch

Use [nvm](https://github.com/nvm-sh/nvm) or [Volta](https://volta.sh/) to manage versions:

```bash
nvm install 20
nvm use 20
```

### Docker-related errors

Docker is only required for Devcontainer. If you're not using it, ignore Docker errors and run directly with `pnpm dev`.

---

## What's Next?

- [Deployment Guide](../30_operations/deployment.md) — Deploy to AWS with CDK
- [Devcontainer Guide](./devcontainer-guide.md) — Docker-based dev environment
- [CONTRIBUTING.md](../../CONTRIBUTING.md) — How to contribute
