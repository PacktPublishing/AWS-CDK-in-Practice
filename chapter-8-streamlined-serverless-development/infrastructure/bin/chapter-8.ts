#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { config } from 'dotenv';

import { Chapter8Stack } from '../lib/chapter-8-stack';
import { Chapter8PipelineStack } from '../lib/chapter-8-pipeline-stack';

config({ path: '.env.production' });

const app = new cdk.App();

if (['ONLY_DEV'].includes(process.env.CDK_MODE || '')) {
  new Chapter8Stack(app, `Chapter8Stack-${process.env.NODE_ENV || ''}`, {
    env: { region: 'us-east-1', account: process.env.CDK_DEFAULT_ACCOUNT },
  });
}

if (['ONLY_PROD'].includes(process.env.CDK_MODE || '')) {
  new Chapter8Stack(app, `Chapter8Stack-${process.env.NODE_ENV || ''}`, {
    env: { region: 'us-east-1', account: process.env.CDK_DEFAULT_ACCOUNT },
  });
}

if (['ONLY_PIPELINE'].includes(process.env.CDK_MODE || '')) {
  new Chapter8PipelineStack(app, 'Chapter8PipelineStack', {
    env: { region: 'us-east-1', account: process.env.CDK_DEFAULT_ACCOUNT },
  });
}
