/* ---------- External Libraries ---------- */
import { Construct } from 'constructs';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import {
  CfnJob as GlueJob,
  CfnCrawler as GlueCrawler,
} from 'aws-cdk-lib/aws-glue';
import {
  ManagedPolicy,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { RemovalPolicy } from 'aws-cdk-lib';
import { resolve } from 'path';

interface IGlue {
  table: Table;
}

export class AWSGlue extends Construct {
  public readonly glue_dynamo_role: Role;

  public readonly glue_crawler: GlueCrawler;

  public readonly glue_s3_crawler: GlueCrawler;

  public readonly glue_export_job: GlueJob;

  constructor(scope: Construct, id: string, props: IGlue) {
    super(scope, id);

    const { table } = props;

    const sourceBucket = new Bucket(this, 'SourceBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Roles:
    this.glue_dynamo_role = new Role(
      scope,
      `Glue-DynamoDBRole-${process.env.NODE_ENV}`,
      {
        assumedBy: new ServicePrincipal('glue.amazonaws.com'),
        roleName: `glue-service-role-${process.env.NODE_ENV?.toLowerCase()}`,
        managedPolicies: [
          ManagedPolicy.fromAwsManagedPolicyName(
            'service-role/AWSGlueServiceRole',
          ),
          ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess'),
        ],
      },
    );

    this.glue_dynamo_role.addToPolicy(
      new PolicyStatement({
        actions: ['dynamodb:*', 's3:*'],
        resources: ['*'],
      }),
    );

    // Script:
    const SCRIPTS_LOCATION = [__dirname, '.', 'scripts'];

    new BucketDeployment(this, 'GlueScript', {
      destinationBucket: sourceBucket,
      sources: [Source.asset(resolve(...SCRIPTS_LOCATION, 'dynamo-to-s3.zip'))],
      destinationKeyPrefix: 'scripts',
      prune: false,
      memoryLimit: 256,
    }); // upload the script into s3

    // Crawlers:
    this.glue_crawler = new GlueCrawler(
      scope,
      `Glue-Dynamo-Crawler-${process.env.NODE_ENV}`,
      {
        role: this.glue_dynamo_role.roleArn,
        targets: {
          dynamoDbTargets: [{ path: table.tableName }],
        },
        databaseName: `maintable-gluedb-${process.env.NODE_ENV?.toLowerCase()}`,
        name: `dynanamo-crawler-${process.env.NODE_ENV?.toLowerCase()}`,
      },
    );

    this.glue_s3_crawler = new GlueCrawler(
      scope,
      `Glue-S3-Crawler-${process.env.NODE_ENV}`,
      {
        role: this.glue_dynamo_role.roleArn,
        targets: {
          dynamoDbTargets: [{ path: table.tableName }],
          s3Targets: [{ path: `s3://${sourceBucket.bucketName}/glue/` }],
        },
        databaseName: `maintable-gluedb-${process.env.NODE_ENV?.toLowerCase()}`,
        name: `s3-crawler-${process.env.NODE_ENV?.toLowerCase()}`,
      },
    );

    // Jobs:
    this.glue_export_job = new GlueJob(
      this,
      `Glue-DynamoDBExport-Job-${process.env.NODE_ENV}`,
      {
        role: this.glue_dynamo_role.roleArn,
        command: {
          name: 'glueetl',
          scriptLocation: `s3://${sourceBucket.bucketName}/scripts/dynamo-to-s3.py`,
          pythonVersion: '3',
        },
        name: `export-dynamodb-to-s3-glue-job-${process.env.NODE_ENV?.toLowerCase()}`,
        glueVersion: '4.0',
        defaultArguments: {
          '--GLUE_DATABASE_NAME': this.glue_crawler.databaseName,
          '--GLUE_TABLE_NAME': table.tableName,
          '--TARGET_S3_BUCKET': `s3://${sourceBucket.bucketName}/glue/`,
          '--JOB_NAME': `export-dynamodb-to-s3-glue-job-${process.env.NODE_ENV?.toLowerCase()}`,
        },
      },
    );
  }
}
