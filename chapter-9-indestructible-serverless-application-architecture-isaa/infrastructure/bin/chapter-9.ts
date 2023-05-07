#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { config } from 'dotenv';

import { Chapter9Stack } from '../lib/chapter-9-stack';
import { Chapter9PipelineStack } from '../lib/chapter-9-pipeline-stack';

config({ path: process.env.DOTENV_CONFIG_PATH });

const app = new cdk.App();

if (['ONLY_DEV'].includes(process.env.CDK_MODE || '')) {
  new Chapter9Stack(app, `Chapter9Stack-${process.env.NODE_ENV || ''}`, {
    env: { region: 'us-east-1', account: process.env.CDK_DEFAULT_ACCOUNT },
  });
}

if (['ONLY_PROD'].includes(process.env.CDK_MODE || '')) {
  new Chapter9Stack(app, `Chapter9Stack-${process.env.NODE_ENV || ''}`, {
    env: { region: 'us-east-1', account: process.env.CDK_DEFAULT_ACCOUNT },
  });
}

if (['ONLY_PIPELINE'].includes(process.env.CDK_MODE || '')) {
  new Chapter9PipelineStack(app, 'Chapter9PipelineStack', {
    env: { region: 'us-east-1', account: process.env.CDK_DEFAULT_ACCOUNT },
  });
}
