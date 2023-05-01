import { App, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { config } from 'dotenv';
import { Chapter9Stack } from '../lib/chapter-9-stack';

const { parsed } = config({ path: '.env.testing' });

describe('Testing Chapter 9 code.', () => {
  // Using assertion tests:
  test('The stack has a ECS cluster configured in the right way.', () => {
    const app = new App();

    const chapter9Stack = new Chapter9Stack(app, 'Chapter9Stack', {
      env: {
        region: parsed?.CDK_DEFAULT_REGION,
        account: parsed?.CDK_DEFAULT_ACCOUNT,
      },
    });

    const template = Template.fromStack(chapter9Stack);

    template.resourceCountIs('AWS::ECS::Cluster', 1);

    template.resourceCountIs('AWS::ECS::TaskDefinition', 1);

    template.resourceCountIs('AWS::ECS::Service', 1);

    template.hasResourceProperties('AWS::ECS::TaskDefinition', {
      ContainerDefinitions: [
        {
          Environment: [
            {
              Name: Match.exact('NODE_ENV'),
              Value: Match.exact('test'),
            },
          ],
          Essential: true,
          Image: Match.objectEquals({
            'Fn::Sub': Match.stringLikeRegexp('ecr'), // a string that has ECR on it.
          }),
          LogConfiguration: {
            LogDriver: Match.stringLikeRegexp('awslogs'),
            Options: {
              'awslogs-group': {
                Ref: Match.stringLikeRegexp('ECSLogGroup'),
              },
              'awslogs-stream-prefix': Match.stringLikeRegexp('chapter9'),
              'awslogs-region': Match.stringLikeRegexp(
                parsed?.CDK_DEFAULT_REGION as string,
              ),
            },
          },
          Memory: 256,
          Name: Match.exact('Express-test'),
          PortMappings: [
            {
              ContainerPort: 80,
              HostPort: 0,
              Protocol: 'tcp',
            },
          ],
        },
      ],
      ExecutionRoleArn: {
        'Fn::GetAtt': Match.arrayWith([
          Match.stringLikeRegexp('TaskDefinition'),
          Match.stringLikeRegexp('Arn'),
        ]),
      },
      Family: Match.stringLikeRegexp('TaskDefinition'),
      NetworkMode: Match.stringLikeRegexp('bridge'),
      RequiresCompatibilities: Match.exact(['EC2']),
      TaskRoleArn: {
        'Fn::GetAtt': Match.arrayWith([
          Match.stringLikeRegexp('TaskDefinition'),
          Match.stringLikeRegexp('Arn'),
        ]),
      },
    });

    template.hasResourceProperties('AWS::ECS::Service', {
      Cluster: {
        Ref: Match.stringLikeRegexp('EcsCluster'),
      },
      DeploymentConfiguration: {
        MaximumPercent: 200,
        MinimumHealthyPercent: 50,
      },
      EnableECSManagedTags: false,
      HealthCheckGracePeriodSeconds: 60,
      LaunchType: Match.exact('EC2'),
      LoadBalancers: [
        {
          ContainerName: Match.exact('Express-test'),
          ContainerPort: 80,
          TargetGroupArn: {
            Ref: Match.stringLikeRegexp('LBtestPublicListenertestECStestGroup'),
          },
        },
      ],
      SchedulingStrategy: Match.exact('REPLICA'),
      TaskDefinition: {
        Ref: Match.stringLikeRegexp('TaskDefinition'),
      },
    });

    template.hasResource('AWS::ECS::Service', {
      DependsOn: [
        Match.stringLikeRegexp('LBtestPublicListenertestECStestGroup'),
        Match.stringLikeRegexp('LBtestPublicListenertest'),
      ],
    });
  });

  test('The stack has a RDS instance configured in the right way.', () => {
    const app = new App();

    const chapter9Stack = new Chapter9Stack(app, 'Chapter9Stack', {
      env: {
        region: parsed?.CDK_DEFAULT_REGION,
        account: parsed?.CDK_DEFAULT_ACCOUNT,
      },
    });

    const template = Template.fromStack(chapter9Stack);

    template.resourceCountIs('AWS::RDS::DBInstance', 1);

    template.hasResourceProperties('AWS::RDS::DBInstance', {
      DBInstanceClass: Match.exact('db.t2.small'),
      AllocatedStorage: Match.exact('100'),
      CopyTagsToSnapshot: true,
      DBInstanceIdentifier: Match.anyValue(),
      DBName: Match.anyValue(),
      DBSubnetGroupName: {
        Ref: Match.stringLikeRegexp('MySQLRDSInstancetestSubnetGroup'),
      },
      Engine: Match.exact('mysql'),
      EngineVersion: Match.anyValue(),
      MasterUsername: {
        'Fn::Join': [
          '',
          [
            '{{resolve:secretsmanager:',
            {
              Ref: Match.stringLikeRegexp('MySQLCredentials'),
            },
            ':SecretString:username::}}',
          ],
        ],
      },
      MasterUserPassword: {
        'Fn::Join': [
          '',
          [
            '{{resolve:secretsmanager:',
            {
              Ref: Match.stringLikeRegexp('MySQLCredentials'),
            },
            ':SecretString:password::}}',
          ],
        ],
      },
      Port: Match.exact('3306'),
      PubliclyAccessible: true,
      StorageType: Match.exact('gp2'),
      VPCSecurityGroups: [
        {
          'Fn::GetAtt': [
            Match.stringLikeRegexp('MySQLRDSInstancetestSecurityGroup'),
            'GroupId',
          ],
        },
      ],
    });

    template.hasResourceProperties('AWS::RDS::DBSubnetGroup', {
      DBSubnetGroupDescription: Match.stringLikeRegexp(
        'Subnet group for MySQL-RDS-Instance-test database',
      ),
      SubnetIds: [
        {
          Ref: Match.stringLikeRegexp('MyVPCtestrdsSubnet1Subnet'),
        },
        {
          Ref: Match.stringLikeRegexp('MyVPCtestrdsSubnet2Subnet'),
        },
        {
          Ref: Match.stringLikeRegexp('MyVPCtestrdsSubnet3Subnet75CD7701'),
        },
      ],
    });
  });

  test('The stack has the VPC configured in the right way.', () => {
    const app = new App();

    const chapter9Stack = new Chapter9Stack(app, 'Chapter9Stack', {
      env: {
        region: parsed?.CDK_DEFAULT_REGION,
        account: parsed?.CDK_DEFAULT_ACCOUNT,
      },
    });

    const template = Template.fromStack(chapter9Stack);

    template.resourceCountIs('AWS::EC2::VPC', 1);

    template.hasResourceProperties('AWS::EC2::VPC', {
      CidrBlock: Match.stringLikeRegexp('10.1.0.0/16'),
      EnableDnsHostnames: true,
      EnableDnsSupport: true,
      InstanceTenancy: Match.exact('default'),
      Tags: [
        {
          Key: Match.exact('Name'),
          Value: Match.anyValue(),
        },
      ],
    });
  });

  // Using snapshot tests:
  it('Matches the snapshot.', () => {
    const stack = new Stack();

    const chapter9Stack = new Chapter9Stack(stack, 'Chapter9Stack', {
      env: {
        region: parsed?.CDK_DEFAULT_REGION,
        account: parsed?.CDK_DEFAULT_ACCOUNT,
      },
    });

    const template = Template.fromStack(chapter9Stack);

    expect(template.toJSON()).toMatchSnapshot();
  });
});
