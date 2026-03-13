# next-amplify-starter-kit — GitHub Copilot Instructions

This is a Turborepo monorepo starter kit for building web apps on AWS with Next.js and CDK.

## Architecture
- `apps/web/` = Next.js 15 frontend (App Router, React 19, Tailwind CSS v3)
- `infra/` = AWS CDK v2 (Amplify Hosting, SES, Cognito, DynamoDB)
- `packages/` = Shared configs (tsconfig, eslint)

## Key Patterns
- TypeScript strict mode, always use `type` keyword for type-only imports
- Named exports (except Next.js pages which use default exports)
- Zod for API request validation
- API routes return `NextResponse.json()` with proper status codes
- One CDK stack per AWS service group
- Use pnpm, not npm or yarn

## API Route Pattern
```typescript
import { NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({ /* ... */ });

export async function POST(request: Request) {
  const body = await request.json();
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
  }
  // ... handle request
  return NextResponse.json({ data: result.data }, { status: 200 });
}
```

## CDK Stack Pattern
```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class MyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // resources here
  }
}
```
