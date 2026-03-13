Create a new AWS CDK stack in infra/lib/$ARGUMENTS-stack.ts. Include:
1. Stack class extending cdk.Stack with proper typing
2. Public properties for resources that other stacks may reference
3. CfnOutput for important resource identifiers
4. Register the stack in infra/bin/app.ts
Follow the existing patterns in infra/lib/amplify-stack.ts and infra/lib/ses-stack.ts.
