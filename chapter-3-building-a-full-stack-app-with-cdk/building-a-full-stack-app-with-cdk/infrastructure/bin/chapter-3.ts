#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';

import { Chapter3Stack } from '../lib/chapter-3-stack';

const app = new cdk.App();

new Chapter3Stack(app, 'Chapter3Stack', {});
