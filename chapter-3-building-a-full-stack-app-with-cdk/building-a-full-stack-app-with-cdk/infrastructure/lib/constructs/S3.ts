import { BlockPublicAccess, Bucket, BucketAccessControl } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import { resolve } from 'path';
import { CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import { v4 as uuidv4 } from 'uuid';

export class S3 extends Construct {
  public readonly web_bucket: Bucket;

  public readonly web_bucket_deployment: BucketDeployment;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.web_bucket = new Bucket(scope, 'WebBucket', {
      bucketName: `chapter-3-web-bucket-${uuidv4()}`,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      publicReadAccess: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ACLS,
      accessControl: BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    this.web_bucket_deployment = new BucketDeployment(scope, 'WebBucketDeployment', {
      sources: [Source.asset(resolve(__dirname, '..', '..', '..', 'web', 'build'))],
      destinationBucket: this.web_bucket,
    });

    new CfnOutput(scope, 'FrontendURL', { value: this.web_bucket.bucketWebsiteUrl });
  }
}
