# CLAUDE.md — Project Intelligence for AI Assistants

## Project Overview

Next.js Amplify Starter Kit is an open-source monorepo template for building production-ready web applications on AWS. It wires together Next.js 15, AWS Amplify hosting, AWS CDK infrastructure-as-code, and GitHub Actions CI/CD into a single cohesive starting point.

**Repository**: `i-Willink-LLC/next-amplify-starter-kit`
**License**: MIT

## Architecture

### Monorepo Structure (Turborepo + pnpm workspaces)

```
next-amplify-starter-kit/
├── apps/web/          → Next.js 15 application (App Router, React 19, Tailwind CSS)
├── packages/
│   ├── tsconfig/      → Shared TypeScript configurations
│   └── eslint-config/ → Shared ESLint configurations
├── infra/             → AWS CDK stacks (TypeScript)
├── docs/              → Project documentation (project, development, operations)
└── .github/workflows/ → CI/CD pipeline definitions
```

### How It Fits Together

- `apps/web` is the deployable Next.js application.
- `packages/*` provide shared configs consumed by both `apps/web` and `infra/` via `workspace:*` references.
- `infra/` defines AWS resources (Amplify app, branch config, build settings) using CDK. It reads env vars from `infra/.env` for local deploy or from GitHub Secrets for CI deploy.
- GitHub Actions runs lint/test/build on every PR, and triggers `cdk deploy` on merge to main when infra files change.
- Amplify Hosting auto-deploys the Next.js app when code is merged to main.

### Key AWS Services

- **AWS Amplify Hosting** — serves the Next.js app with SSR support
- **AWS Secrets Manager** — stores the GitHub PAT used by Amplify to pull source code
- **AWS SES** — (optional) email sending capability

## Development Workflow

### Local Development

```bash
pnpm install          # Install all dependencies
pnpm dev              # Start Next.js dev server (http://localhost:3000)
pnpm build            # Production build (all workspaces via Turborepo)
pnpm lint             # ESLint across all workspaces
pnpm format           # Prettier formatting
pnpm test             # Run tests (Vitest)
```

### Infrastructure

```bash
cd infra
cp .env.example .env  # Set AWS credentials and GITHUB_TOKEN
npx cdk diff          # Preview infrastructure changes
npx cdk deploy        # Deploy to AWS
npx cdk synth         # Generate CloudFormation template
```

### Devcontainer

The project includes a Devcontainer configuration. Open in VS Code and use "Dev Containers: Reopen in Container" for a consistent environment with all tools pre-installed.

## Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| **Turborepo** over Nx | Simpler config, zero-config caching, good enough for this scale. Turbo tasks defined in `turbo.json`. |
| **CDK** over raw CloudFormation | Type-safe infrastructure, better abstractions, same deployment target. Lives in `infra/` as a separate workspace. |
| **pnpm** over npm/yarn | Strict dependency resolution, disk-efficient via content-addressable store, native workspace support. Version pinned in `package.json` (`packageManager` field). |
| **App Router** (Next.js 15) | Server Components by default, better streaming SSR, the future direction of Next.js. |
| **Vitest** over Jest | Faster execution, native ESM support, better TypeScript integration. Config in `apps/web/vitest.config.mts`. |

## Coding Conventions

- **Commit messages**: Conventional Commits format (`feat:`, `fix:`, `docs:`, `chore:`, etc.)
- **Linting**: ESLint with shared config from `packages/eslint-config/`
- **Formatting**: Prettier (run `pnpm format` before committing)
- **TypeScript**: Strict mode, shared base config from `packages/tsconfig/`
- **File naming**: kebab-case for files, PascalCase for React components
- **Documentation**: Markdown files in `docs/`, organized by category (00_project, 20_development, 30_operations)

## What Makes This Different

- **Not just frontend boilerplate** — includes real infrastructure code, CI/CD pipelines, and deployment automation
- **AI-native development** — this CLAUDE.md file, Devcontainer support, and clear project structure make it easy for AI assistants to understand and contribute to the codebase
- **Production-ready from clone** — auth patterns, environment management, secret handling, and multi-environment deployment are all pre-configured
- **Minimal lock-in** — MIT license, standard tools, no proprietary abstractions. Fork it and make it yours.
