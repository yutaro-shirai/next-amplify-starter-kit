#!/usr/bin/env node
import 'source-map-support/register';
import * as dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config();

import * as cdk from 'aws-cdk-lib';
import { AmplifyStack } from '../lib/amplify-stack';
import { SesStack } from '../lib/ses-stack';

const app = new cdk.App();

// Amplify Hosting Stack
new AmplifyStack(app, 'NextAmplifyStarterKit', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION || 'ap-northeast-1',
    },
    description: 'Next.js Amplify Starter Kit - Hosting Infrastructure',
});

// SES Stack (optional - only deployed if SES_FROM_EMAIL or SES_DOMAIN is configured)
if (process.env.SES_FROM_EMAIL || process.env.SES_DOMAIN) {
    new SesStack(app, 'SesStack', {
        env: {
            account: process.env.CDK_DEFAULT_ACCOUNT,
            region: process.env.SES_REGION || process.env.CDK_DEFAULT_REGION || 'ap-northeast-1',
        },
        description: 'Next.js Amplify Starter Kit - SES Email Infrastructure',
    });
}
