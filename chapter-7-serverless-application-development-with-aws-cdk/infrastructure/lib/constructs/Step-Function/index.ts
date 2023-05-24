import { Construct } from 'constructs';
import { JsonPath, StateMachine } from 'aws-cdk-lib/aws-stepfunctions';
import { CallAwsService } from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Duration, Stack } from 'aws-cdk-lib';
import { Effect, Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  PhysicalResourceId,
} from 'aws-cdk-lib/custom-resources';
import { HostedZone, IHostedZone } from 'aws-cdk-lib/aws-route53';
import { Route53 } from '../Route53';

export class StepFunction extends Construct {
  readonly stateMachine: StateMachine;

  constructor(scope: Construct, id: string, _props: Record<string, never>) {
    super(scope, id);

    const emailAddress = process.env.EMAIL_ADDRESS;

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
        logRetention: 7,
      },
    );

    const emailBody =
      '<h2>Chapter 7 Step Function.</h2><p>This step function was triggered by: <strong>{}</strong>.';

    const sendEmail = new CallAwsService(
      this,
      `Send-Email-${process.env.NODE_ENV || ''}`,
      {
        service: 'sesv2',
        action: 'sendEmail',
        parameters: {
          Destination: {
            ToAddresses: [emailAddress],
          },
          FromEmailAddress: emailAddress,
          Content: {
            Simple: {
              Body: {
                Html: {
                  Charset: 'UTF-8',
                  Data: JsonPath.format(
                    emailBody,
                    JsonPath.stringAt('$.message'),
                  ),
                },
              },
              Subject: {
                Charset: 'UTF-8',
                Data: 'Chapter 7 Step Function',
              },
            },
          },
        },
        iamResources: [resourceArn],
      },
    );

    const stateMachine = new StateMachine(this, 'State-Machine', {
      definition: sendEmail,
      timeout: Duration.minutes(5),
    });

    stateMachine.role.attachInlinePolicy(
      new Policy(this, `SESPermissions-${process.env.NODE_ENV || ''}`, {
        statements: [
          new PolicyStatement({
            actions: ['ses:SendEmail'],
            resources: [resourceArn],
          }),
        ],
      }),
    );

    this.stateMachine = stateMachine;
  }
}
