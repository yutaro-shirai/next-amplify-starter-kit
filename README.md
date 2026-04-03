# Next.js Amplify Starter Kit

[日本語 (Japanese)](README.ja.md)

[![CI](https://github.com/i-Willink-Inc/next-amplify-starter-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/i-Willink-Inc/next-amplify-starter-kit/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A production-ready monorepo starter kit for building and deploying web applications with **Next.js 16**, **AWS Amplify**, and **AWS CDK**. Ship fast, scale confidently.

## Why This Kit?

- **Zero-config monorepo** — Turborepo + pnpm workspace, pre-configured and ready to go
- **Infrastructure as Code** — AWS CDK stacks for Amplify Hosting and SES email, deploy with one command
- **Modern stack** — Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- **CI/CD included** — GitHub Actions for lint, build, test, and CDK deployment
- **AI-friendly** — Ships with `CLAUDE.md` for Claude Code / AI-assisted development

## Tech Stack

| Technology | Description |
|------------|-------------|
| **Turborepo** | High-performance build system and monorepo management |
| **Next.js 16** | App Router + React 19 + SSR support |
| **AWS CDK** | Infrastructure as Code for reproducibility |
| **AWS SES** | Email delivery (contact form) |
| **Tailwind CSS 4** | Utility-first styling |
| **GitHub Actions** | Complete CI/CD pipeline |
| **pnpm** | Fast and efficient package management |
| **Devcontainer** | Consistent development environment |

## Project Structure

```
next-amplify-starter-kit/
├── apps/
│   └── web/                 # Next.js Application
├── packages/
│   ├── tsconfig/            # Shared TypeScript Config
│   └── eslint-config/       # Shared ESLint Config
├── infra/                   # AWS CDK Infrastructure Code
├── docs/                    # Documentation
│   ├── 00_project/          # Project Management
│   ├── 20_development/      # Development Guide
│   └── 30_operations/       # Operations Guide
└── .github/workflows/       # CI/CD Definitions
```

## Quick Start

### Prerequisites

| Tool | Minimum Version | Recommended |
|------|-----------------|-------------|
| Node.js | 18.17.0 | 20.x LTS |
| pnpm | 8.0.0 | 9.x+ |
| Docker | — | Latest (for Devcontainer) |

### Setup

```bash
# Clone
git clone https://github.com/i-Willink-Inc/next-amplify-starter-kit.git
cd next-amplify-starter-kit

# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

Open http://localhost:3000.

### Using Devcontainer (Recommended)

1. Start Docker Desktop or Rancher Desktop
2. Open the project in VS Code
3. Command Palette (Ctrl+Shift+P) → **"Dev Containers: Reopen in Container"**

See [Devcontainer Guide](docs/20_development/devcontainer-guide.md) for details.

## Deploy to AWS

### Deployment Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  Step 1: CDK Deploy (Local or GitHub Actions)                   │
│          → Create Amplify service on AWS                        │
│          → Set up GitHub repository connection                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 2: Merge to main branch                                   │
│          → Amplify automatically detects changes                │
│          → Build and deploy according to amplify.yml            │
└─────────────────────────────────────────────────────────────────┘
```

### Option A: Local Deploy (recommended for first setup)

```bash
# Set up environment variables
cp infra/.env.example infra/.env
# Edit infra/.env with your AWS credentials and GITHUB_TOKEN

# Deploy
cd infra
npx cdk deploy
```

### Option B: GitHub Actions (automated)

1. Add AWS credentials to GitHub Secrets (OIDC or Access Key)
2. Push changes to `infra/` on `main`
3. GitHub Actions runs CDK deploy automatically

See [Deployment Guide](docs/30_operations/deployment.md) for full instructions.

## Required Secrets

### AWS Secrets Manager

| Secret Name | Description |
|-------------|-------------|
| `github/amplify-token` | GitHub PAT with `repo` + `admin:repo_hook` scopes |

### GitHub Secrets (for CI/CD deploy)

**OIDC (recommended):**

| Secret | Example |
|--------|---------|
| `AWS_ROLE_ARN` | `arn:aws:iam::123456789012:role/GitHubActionsRole` |

**Access Key (alternative):**

| Secret | Example |
|--------|---------|
| `AWS_ACCESS_KEY_ID` | `AKIAXXXXXXXX` |
| `AWS_SECRET_ACCESS_KEY` | `xxxxxxxx` |

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format with Prettier |
| `pnpm test` | Run tests |

### CDK Commands (from `infra/`)

| Command | Description |
|---------|-------------|
| `npx cdk diff` | Preview changes |
| `npx cdk deploy` | Deploy stack |
| `npx cdk synth` | Generate CloudFormation template |

## Documentation

| Document | Audience | Description |
|----------|----------|-------------|
| [Project Plan](docs/00_project/PROJECT_PLAN.md) | Everyone | Project overview and plan |
| [Getting Started](docs/20_development/getting-started.md) | Developers | Dev environment setup |
| [Devcontainer Guide](docs/20_development/devcontainer-guide.md) | Developers | Docker dev environment |
| [SES Email Guide](docs/20_development/ses-email-guide.md) | Developers | Email functionality |
| [Deployment Guide](docs/30_operations/deployment.md) | Operators | AWS deployment steps |

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

We use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

## License

[MIT](LICENSE)
