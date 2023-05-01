/* ---------- External Libraries ---------- */
import * as path from 'path';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Duration, aws_logs as logs } from 'aws-cdk-lib';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { StateMachine } from 'aws-cdk-lib/aws-stepfunctions';

interface IProps {
  vpc?: Vpc;
  dynamoTable: Table;
  stateMachine: StateMachine;
}

export class DynamoPost extends Construct {
  public readonly func: NodejsFunction;

  constructor(scope: Construct, id: string, props: IProps) {
    super(scope, id);

    const { dynamoTable, stateMachine } = props;

    this.func = new NodejsFunction(scope, 'dynamo-post', {
      runtime: Runtime.NODEJS_16_X,
      entry: path.resolve(__dirname, 'code', 'index.ts'),
      handler: 'handler',
      timeout: Duration.seconds(30),
      environment: {
        NODE_ENV: process.env.NODE_ENV as string,
        TABLE_NAME: dynamoTable.tableName,
        REGION: process.env.CDK_DEFAULT_REGION as string,
        STATE_MACHINE_ARN: stateMachine.stateMachineArn,
      },
      logRetention: logs.RetentionDays.TWO_WEEKS,
    });

    dynamoTable.grantWriteData(this.func);
    stateMachine.grantStartExecution(this.func);
  }
}
