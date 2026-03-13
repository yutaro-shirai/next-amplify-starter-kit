Synthesize and deploy all CDK stacks to AWS. Steps:
1. Run `cd infra && npx cdk synth` to check for synthesis errors
2. If successful, run `cd infra && npx cdk deploy --all --require-approval never`
3. Report the outputs (User Pool ID, API endpoints, etc.)
4. If any stack fails, show the error and suggest fixes
