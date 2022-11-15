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

import config from '../../../../config.json';

interface Props {
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

    this.log_group = new LogGroup(
      scope,
      `ECSLogGroup-${process.env.NODE_ENV || ''}`,
      {
        logGroupName: `ecs-logs-chapter-5-${process.env.NODE_ENV || ''}`,
        retention: RetentionDays.ONE_DAY,
        removalPolicy: RemovalPolicy.DESTROY,
      },
    );

    this.cluster = new ecs.Cluster(
      scope,
      `EcsCluster-${process.env.NODE_ENV || ''}`,
      { vpc: props.vpc },
    );

    this.cluster.addCapacity(
      `DefaultAutoScalingGroup-${process.env.NODE_ENV || ''}`,
      {
        instanceType: new InstanceType('t2.micro'),
      },
    );

    this.task_definition = new ecs.Ec2TaskDefinition(
      scope,
      `TaskDefinition-${process.env.NODE_ENV || ''}`,
    );

    this.container = this.task_definition.addContainer(
      `Express-${process.env.NODE_ENV || ''}`,
      {
        image: ecs.ContainerImage.fromAsset(
          resolve(__dirname, '..', '..', '..', '..', 'server'),
        ),
        environment: {
          NODE_ENV: process.env.NODE_ENV as string,
        },
        memoryLimitMiB: 256,
        logging: ecs.LogDriver.awsLogs({
          streamPrefix: `chapter5-${process.env.NODE_ENV || ''}`,
          logGroup: this.log_group,
        }),
      },
    );

    this.container.addPortMappings({
      containerPort: 80,
      protocol: ecs.Protocol.TCP,
    });

    this.service = new ecs.Ec2Service(
      scope,
      `Service-${process.env.NODE_ENV || ''}`,
      {
        cluster: this.cluster,
        taskDefinition: this.task_definition,
      },
    );

    this.load_balancer = new ApplicationLoadBalancer(
      scope,
      `LB-${process.env.NODE_ENV || ''}`,
      {
        vpc: props.vpc,
        internetFacing: true,
        loadBalancerName: `chapter5-lb-${process.env.NODE_ENV || ''}`,
      },
    );

    this.listener = this.load_balancer.addListener(
      `PublicListener-${process.env.NODE_ENV || ''}`,
      {
        port: 443,
        open: true,
        certificates: [props.acm.certificate],
      },
    );

    this.listener.addTargets(`ECS-${process.env.NODE_ENV || ''}`, {
      protocol: ApplicationProtocol.HTTP,
      targets: [
        this.service.loadBalancerTarget({
          containerName: `Express-${process.env.NODE_ENV || ''}`,
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

    const backEndSubDomain =
      process.env.NODE_ENV === 'Production'
        ? config.backend_subdomain
        : config.backend_dev_subdomain;

    new ARecord(this, 'BackendAliasRecord', {
      zone: props.route53.hosted_zone,
      target: RecordTarget.fromAlias(
        new LoadBalancerTarget(this.load_balancer),
      ),
      recordName: `${backEndSubDomain}.${config.domain_name}`,
    });

    new CfnOutput(scope, 'BackendURL', {
      value: this.load_balancer.loadBalancerDnsName,
    });
  }
}
