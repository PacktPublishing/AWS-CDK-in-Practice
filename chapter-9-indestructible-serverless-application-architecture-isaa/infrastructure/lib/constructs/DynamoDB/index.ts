/* ---------- External Libraries ---------- */
import { RemovalPolicy, Stack } from 'aws-cdk-lib';
import {
  AttributeType,
  BillingMode,
  StreamViewType,
  Table,
} from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { DynamoDBSeeder, Seeds } from '@cloudcomponents/cdk-dynamodb-seeder';
import { v4 as uuidv4 } from 'uuid';
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  PhysicalResourceId,
} from 'aws-cdk-lib/custom-resources';
import { Effect, Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { SendEmail } from '../Lambda/sendEmail';

export class DynamoDB extends Construct {
  readonly table: Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.table = new Table(this, `Dynamo-Table-${process.env.NODE_ENV || ''}`, {
      partitionKey: { name: 'id', type: AttributeType.STRING },
      tableName: `todolist_${process.env.NODE_ENV?.toLowerCase() || ''}`,
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
      stream: StreamViewType.NEW_IMAGE,
    });

    new DynamoDBSeeder(
      this,
      `Dynamo-InlineSeeder-${process.env.NODE_ENV || ''}`,
      {
        table: this.table,
        seeds: Seeds.fromInline([
          {
            id: uuidv4(),
            todo_name: 'First todo',
            todo_description: "That's a todo for demonstration purposes",
            todo_completed: true,
          },
        ]),
      },
    );

    // ---

    const sendEmailLambda = new SendEmail(this, 'send-email-stream', {
      dynamoTable: this.table,
    });

    const emailAddress = process.env.EMAIL_ADDRESS || '';

    const resourceArn = `arn:aws:ses:${Stack.of(this).region}:${
      Stack.of(this).account
    }:identity/${emailAddress}`;

    const verifyEmailIdentityPolicy = AwsCustomResourcePolicy.fromStatements([
      new PolicyStatement({
        actions: ['ses:VerifyEmailIdentity', 'ses:DeleteIdentity'],
        effect: Effect.ALLOW,
        resources: ['*'],
      }),
    ]);

    // Create a new SES Email Identity
    new AwsCustomResource(
      this,
      `Verify-Email-Identity-${process.env.NODE_ENV || ''}`,
      {
        onCreate: {
          service: 'SES',
          action: 'verifyEmailIdentity',
          parameters: {
            EmailAddress: emailAddress,
          },
          physicalResourceId: PhysicalResourceId.of(`verify-${emailAddress}`),
          region: Stack.of(this).region,
        },
        onDelete: {
          service: 'SES',
          action: 'deleteIdentity',
          parameters: {
            Identity: emailAddress,
          },
          region: Stack.of(this).region,
        },
        policy: verifyEmailIdentityPolicy,
        logRetention: 1,
      },
    );

    sendEmailLambda.func.role?.attachInlinePolicy(
      new Policy(this, `SESPermissions-${process.env.NODE_ENV || ''}`, {
        statements: [
          new PolicyStatement({
            actions: ['ses:SendEmail'],
            resources: [resourceArn],
          }),
        ],
      }),
    );
  }
}
