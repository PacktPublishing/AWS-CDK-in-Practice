import * as ecs from 'aws-cdk-lib/aws-ecs';
import { CfnOutput, Duration, RemovalPolicy } from 'aws-cdk-lib';
import { InstanceType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import {
  ApplicationListener,
  ApplicationLoadBalancer,
  ApplicationProtocol,
  Protocol,
} from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { resolve } from 'path';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { ARecord, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { LoadBalancerTarget } from 'aws-cdk-lib/aws-route53-targets';

import { ACM } from '../ACM';
import { Route53 } from '../Route53';
import { RDS } from '../RDS';

import { backend_subdomain, domain_name } from '../../../../config.json';

interface Props {
  rds: RDS;
  vpc: Vpc;
  acm: ACM;
  route53: Route53;
}

export class ECS extends Construct {
  public readonly cluster: ecs.Cluster;

  public readonly task_definition: ecs.Ec2TaskDefinition;

  public readonly container: ecs.ContainerDefinition;

  public readonly service: ecs.Ec2Service;

  public readonly load_balancer: ApplicationLoadBalancer;

  public readonly listener: ApplicationListener;

  public readonly log_group: LogGroup;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    this.log_group = new LogGroup(scope, 'ECSLogGroup', {
      logGroupName: 'ecs-logs-chapter-4',
      retention: RetentionDays.ONE_DAY,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    this.cluster = new ecs.Cluster(scope, 'EcsCluster', { vpc: props.vpc });

    this.cluster.addCapacity('DefaultAutoScalingGroup', {
      instanceType: new InstanceType('t2.micro'),
    });

    this.task_definition = new ecs.Ec2TaskDefinition(scope, 'TaskDefinition');

    this.container = this.task_definition.addContainer('Express', {
      image: ecs.ContainerImage.fromAsset(
        resolve(__dirname, '..', '..', '..', '..', 'server'),
      ),
      memoryLimitMiB: 256,
      logging: ecs.LogDriver.awsLogs({
        streamPrefix: 'chapter4',
        logGroup: this.log_group,
      }),
      environment: {
        RDS_HOST: props.rds.instance.instanceEndpoint.hostname,
      },
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
      loadBalancerName: 'chapter4-lb',
    });

    this.listener = this.load_balancer.addListener('PublicListener', {
      port: 443,
      open: true,
      certificates: [props.acm.certificate],
    });

    this.listener.addTargets('ECS', {
      protocol: ApplicationProtocol.HTTP,
      targets: [
        this.service.loadBalancerTarget({
          containerName: 'Express',
          containerPort: 80,
        }),
      ],
      healthCheck: {
        protocol: Protocol.HTTP,
        path: '/health',
        timeout: Duration.seconds(10),
        unhealthyThresholdCount: 5,
        healthyThresholdCount: 5,
        interval: Duration.seconds(60),
      },
    });

    new ARecord(this, 'BackendAliasRecord', {
      zone: props.route53.hosted_zone,
      target: RecordTarget.fromAlias(
        new LoadBalancerTarget(this.load_balancer),
      ),
      recordName: `${backend_subdomain}.${domain_name}`,
    });

    new CfnOutput(scope, 'BackendURL', {
      value: this.load_balancer.loadBalancerDnsName,
    });
  }
}
