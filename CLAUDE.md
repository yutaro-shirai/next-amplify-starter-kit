# Next.js Amplify Starter Kit — Developer Guide for Claude Code

## Project Overview
A production-ready monorepo starter kit for building web applications on AWS.
Features Next.js 15 (App Router, React 19) with AWS Amplify hosting and CDK infrastructure.

## Architecture

```
next-amplify-starter-kit/
├── apps/web/         → Next.js 15 frontend (App Router, SSR)
│   └── src/
│       ├── app/      → Pages and API routes
│       └── lib/      → Shared utilities (SES client, auth, db)
├── infra/            → AWS CDK stacks
│   └── lib/
│       ├── amplify-stack.ts   → Amplify Hosting (SSR)
│       ├── ses-stack.ts       → SES email service
│       ├── auth-stack.ts      → Cognito authentication
│       └── database-stack.ts  → DynamoDB tables
├── packages/
│   ├── tsconfig/     → Shared TypeScript configs
│   └── eslint-config/→ Shared ESLint configs
└── docs/             → Project documentation (EN + JA)
```

## Tech Stack
- **Frontend**: Next.js 15 / React 19 / Tailwind CSS v3 / TypeScript 5.7
- **Hosting**: AWS Amplify (WEB_COMPUTE / SSR)
- **Email**: AWS SES (transactional emails)
- **Auth**: AWS Cognito (sign up, login, OAuth, password reset)
- **Database**: DynamoDB (pay-per-request, CRUD API)
- **Infrastructure**: AWS CDK v2 (TypeScript)
- **Package Manager**: pnpm 10+ with Turborepo
- **CI/CD**: GitHub Actions + Amplify auto-deploy

## Coding Conventions
- TypeScript strict mode in all packages
- Prefer named exports (except Next.js page components which use default exports)
- Use `type` imports for type-only imports: `import type { Foo } from './foo'`
- Zod for runtime validation (API routes, form inputs)
- API routes return `NextResponse.json()` with proper status codes
- CDK stacks: one stack per AWS service, env vars via `process.env`
- Documentation: bilingual (English + Japanese)

## Common Commands
```bash
pnpm install          # Install all dependencies
pnpm dev              # Start dev server (http://localhost:3000)
pnpm build            # Build all packages
pnpm test             # Run all tests
pnpm lint             # Lint all packages
pnpm format           # Format all files with Prettier

cd infra
pnpm synth            # Synthesize CDK stacks (dry run)
pnpm deploy           # Deploy all CDK stacks to AWS
```

## Environment Variables
Copy `.env.local.example` to `.env.local` in `apps/web/` for local development.
Copy `.env.example` to `.env` in `infra/` for CDK deployment.

Key variables:
- `SES_FROM_EMAIL` — Verified sender email for SES
- `CDK_DEFAULT_ACCOUNT` / `CDK_DEFAULT_REGION` — AWS account and region
- `GITHUB_TOKEN` — GitHub access token for Amplify source connection

## CDK Stack Dependency
```
AmplifyStack (hosting)  ← independent
SesStack (email)        ← independent, conditional on SES_FROM_EMAIL
AuthStack (cognito)     ← independent
DatabaseStack (dynamo)  ← independent
```

## Adding New Features
1. Create a new CDK stack in `infra/lib/` if the feature needs AWS resources
2. Register the stack in `infra/bin/app.ts`
3. Add frontend pages in `apps/web/src/app/`
4. Add API routes in `apps/web/src/app/api/`
5. Add shared utilities in `apps/web/src/lib/`
6. Update documentation in both English and Japanese

## StackForge Integration
This OSS project is the foundation for [StackForge](https://stackforge.i-willink.com),
an AI-native SaaS development platform. StackForge provides:
- One-click AWS environment setup
- Advanced Skills, Commands, and Prompts for AI-assisted development
- Project management dashboard
- Template configurator

To use this starter kit manually, follow the Quick Start in README.md.
For an automated experience, visit StackForge.
