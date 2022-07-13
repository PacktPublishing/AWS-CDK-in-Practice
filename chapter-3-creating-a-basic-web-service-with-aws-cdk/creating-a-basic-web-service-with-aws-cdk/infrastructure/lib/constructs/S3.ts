import { Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import { resolve } from 'path';
import { CfnOutput, RemovalPolicy } from 'aws-cdk-lib';

export class S3 extends Construct {
  public readonly web_bucket: Bucket;

  public readonly web_bucket_deployment: BucketDeployment;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.web_bucket = new Bucket(scope, 'WebBucket', {
      bucketName: 'chapter-3-web-bucket',
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      publicReadAccess: true,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    this.web_bucket_deployment = new BucketDeployment(scope, 'WebBucketDeployment', {
      sources: [Source.asset(resolve(__dirname, '..', '..', '..', 'web', 'build'))],
      destinationBucket: this.web_bucket,
    });

    new CfnOutput(scope, 'FrontendURL', { value: this.web_bucket.bucketDomainName });
  }
}
