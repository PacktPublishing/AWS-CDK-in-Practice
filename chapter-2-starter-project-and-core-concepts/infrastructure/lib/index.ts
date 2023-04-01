import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { S3Bucket } from './constructs/S3Bucket';

export class WebStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const bucket = new S3Bucket(this, 'MyRemovableBucket', {
      environment: 'development'
    });
  }
}
