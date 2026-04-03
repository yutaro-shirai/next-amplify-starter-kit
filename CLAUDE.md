# CLAUDE.md — Next.js Amplify Starter Kit

This file provides context for Claude Code and other AI-assisted development tools.

## Project Overview

A production-ready monorepo starter kit: **Next.js 16 + AWS Amplify + CDK**. Designed for rapid deployment of web applications with infrastructure as code.

## Architecture

```
Monorepo (Turborepo + pnpm)
├── apps/web          → Next.js 16 (App Router, React 19, Tailwind CSS 4)
├── packages/tsconfig → Shared TypeScript config
├── packages/eslint-config → Shared ESLint config
└── infra/            → AWS CDK (AmplifyStack + SesStack)
```

### Key Design Decisions

- **App Router only** — No Pages Router. All routes in `apps/web/src/app/`.
- **Server Components by default** — Use `'use client'` only when needed.
- **CDK over Amplify CLI** — Infrastructure is defined in `infra/lib/` as TypeScript CDK stacks, not via `amplify init`.
- **Two CDK stacks**: `AmplifyStack` (hosting + GitHub integration) and `SesStack` (email via SES).

## Development

```bash
pnpm install    # Install all dependencies
pnpm dev        # Start Next.js dev server (http://localhost:3000)
pnpm build      # Production build (all packages)
pnpm lint       # ESLint across all packages
pnpm format     # Prettier formatting
```

### CDK Commands (run from `infra/`)

```bash
npx cdk diff     # Preview infrastructure changes
npx cdk deploy   # Deploy to AWS
npx cdk synth    # Generate CloudFormation template
```

## Code Conventions

- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/) — `feat:`, `fix:`, `docs:`, `chore:`, etc.
- **Formatting**: Prettier (auto-configured). Run `pnpm format` before committing.
- **Linting**: ESLint with shared config from `packages/eslint-config/`.
- **TypeScript**: Strict mode. Shared config in `packages/tsconfig/`.

## File Locations

| What | Where |
|------|-------|
| Next.js pages/routes | `apps/web/src/app/` |
| API routes | `apps/web/src/app/api/` |
| Shared utilities | `apps/web/src/lib/` |
| Global styles | `apps/web/src/app/globals.css` |
| CDK stacks | `infra/lib/` |
| CDK entry point | `infra/bin/` |
| CI/CD | `.github/workflows/ci.yml`, `.github/workflows/deploy-infra.yml` |
| Devcontainer | `.devcontainer/` |

## Infrastructure

- **Hosting**: AWS Amplify Hosting (auto-deploys on merge to `main`)
- **Email**: AWS SES (contact form at `/contact` → API route `/api/contact`)
- **Auth for GitHub Actions**: Supports both OIDC (recommended) and IAM Access Key
- **Region**: `ap-northeast-1` (Tokyo) by default

## Testing

Tests are not yet implemented (`apps/web` has a placeholder). When adding tests:
- Place test files next to the source files (`*.test.ts` / `*.test.tsx`)
- Use the `pnpm test` command from root

## Common Tasks

### Add a new page
Create `apps/web/src/app/<route>/page.tsx`. It's a Server Component by default.

### Add a new API route
Create `apps/web/src/app/api/<route>/route.ts` with exported HTTP method handlers (`GET`, `POST`, etc.).

### Add a new CDK stack
1. Create `infra/lib/<name>-stack.ts`
2. Register it in `infra/bin/`
3. Update `infra/package.json` if new AWS SDK dependencies are needed

### Add a shared package
1. Create `packages/<name>/` with its own `package.json`
2. Add it to `pnpm-workspace.yaml` (already covered by `packages/*` glob)
3. Reference it from consumers as `@repo/<name>` with `workspace:*`
