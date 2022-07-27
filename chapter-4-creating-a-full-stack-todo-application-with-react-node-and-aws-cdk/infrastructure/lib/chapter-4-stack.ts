import { Stack, StackProps } from 'aws-cdk-lib';
import { Port } from 'aws-cdk-lib/aws-ec2';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

import { ECS } from './constructs/ECS';
import { RDS } from './constructs/RDS';
import { S3 } from './constructs/S3';

export class Chapter3Stack extends Stack {
  public readonly s3: S3;

  public readonly ecs: ECS;

  public readonly rds: RDS;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // this.s3 = new S3(this, 'S3');

    this.rds = new RDS(this, 'RDS');

    this.ecs = new ECS(this, 'ECS');

    this.ecs.node.addDependency(this.rds);

    this.rds.instance.connections.allowFrom(this.ecs.cluster, Port.tcp(3306));
    this.ecs.container.addToExecutionPolicy(
      new PolicyStatement({
        actions: ['rds:*', 'secretsmanager:*'],
        resources: ['*'],
      }),
    );
  }
}
