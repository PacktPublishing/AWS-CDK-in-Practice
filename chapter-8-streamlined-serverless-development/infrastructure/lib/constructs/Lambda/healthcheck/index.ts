/* ---------- External Libraries ---------- */
import * as path from 'path';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Duration, aws_logs as logs } from 'aws-cdk-lib';

export class HealthCheckLambda extends Construct {
  public readonly func: NodejsFunction;

  constructor(scope: Construct, id: string, props: any) {
    super(scope, id);

    this.func = new NodejsFunction(scope, 'health-check-lambda', {
      runtime: Runtime.NODEJS_16_X,
      entry: path.resolve(__dirname, 'lambda', 'index.ts'),
      handler: 'handler',
      timeout: Duration.seconds(30),
      environment: {},
      logRetention: logs.RetentionDays.TWO_WEEKS,
    });
  }
}
