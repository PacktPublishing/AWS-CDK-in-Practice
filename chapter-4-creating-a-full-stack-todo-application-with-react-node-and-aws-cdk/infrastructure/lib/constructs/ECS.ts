import * as ecs from 'aws-cdk-lib/aws-ecs';
import { CfnOutput, Duration } from 'aws-cdk-lib';
import { InstanceType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import {
  ApplicationListener,
  ApplicationLoadBalancer,
} from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { resolve } from 'path';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';

interface Props {
  vpc: Vpc;
}

export class ECS extends Construct {
  public readonly cluster: ecs.Cluster;

  public readonly task_definition: ecs.Ec2TaskDefinition;

  public readonly container: ecs.ContainerDefinition;

  public readonly service: ecs.Ec2Service;

  public readonly load_balancer: ApplicationLoadBalancer;

  public readonly listener: ApplicationListener;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    this.cluster = new ecs.Cluster(scope, 'EcsCluster', { vpc: props.vpc });

    this.cluster.addCapacity('DefaultAutoScalingGroup', {
      instanceType: new InstanceType('t2.micro'),
    });

    this.task_definition = new ecs.Ec2TaskDefinition(scope, 'TaskDefinition');

    this.container = this.task_definition.addContainer('Express', {
      image: ecs.ContainerImage.fromAsset(
        resolve(__dirname, '..', '..', '..', 'server'),
      ),
      memoryLimitMiB: 256,
      logging: ecs.LogDriver.awsLogs({
        streamPrefix: 'chapter4',
        logRetention: RetentionDays.ONE_DAY,
      }),
    });

    this.container.addPortMappings({
      containerPort: 80,
      protocol: ecs.Protocol.TCP,
    });

    this.service = new ecs.Ec2Service(scope, 'Service', {
      cluster: this.cluster,
      taskDefinition: this.task_definition,
    });

    this.load_balancer = new ApplicationLoadBalancer(scope, 'LB', {
      vpc: props.vpc,
      internetFacing: true,
    });

    this.listener = this.load_balancer.addListener('PublicListener', {
      port: 80,
      open: true,
    });

    this.listener.addTargets('ECS', {
      port: 80,
      targets: [
        this.service.loadBalancerTarget({
          containerName: 'Express',
          containerPort: 80,
        }),
      ],
      healthCheck: {
        interval: Duration.seconds(60),
        path: '/health',
        timeout: Duration.seconds(5),
      },
    });

    new CfnOutput(scope, 'BackendURL', {
      value: this.load_balancer.loadBalancerDnsName,
    });
  }
}
