#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';

import { Chapter3Stack } from '../lib/chapter-4-stack';

const app = new cdk.App();

new Chapter3Stack(app, 'Chapter4Stack', {
  env: { region: 'us-east-1', account: process.env.CDK_DEFAULT_ACCOUNT },
});
