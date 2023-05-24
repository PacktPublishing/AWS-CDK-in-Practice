import { CfnOutput, Duration } from 'aws-cdk-lib';
import { InstanceType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import {
  Cluster,
  ContainerDefinition,
  ContainerImage,
  Protocol,
  LogDriver,
  FargateService,
  FargateTaskDefinition
} from 'aws-cdk-lib/aws-ecs';
import {
  ApplicationListener,
  ApplicationLoadBalancer,
} from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Dynamodb } from './Dynamodb';
import { resolve } from 'path';

interface Props {
  dynamodb: Dynamodb;
}

export class ECS extends Construct {
  public readonly vpc: Vpc;

  public readonly cluster: Cluster;

  public readonly task_definition: FargateTaskDefinition;

  public readonly container: ContainerDefinition;

  public readonly service: FargateService;

  public readonly load_balancer: ApplicationLoadBalancer;

  public readonly listener: ApplicationListener;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    this.vpc = new Vpc(scope, 'Vpc', { maxAzs: 2 });

    this.cluster = new Cluster(scope, 'EcsCluster', { vpc: this.vpc });

    this.cluster.addCapacity('DefaultAutoScalingGroup', {
      instanceType: new InstanceType('t2.micro'),
    });

    this.task_definition = new FargateTaskDefinition(scope, 'TaskDefinition');

    this.container = this.task_definition.addContainer('Express', {
      image: ContainerImage.fromAsset(resolve(__dirname, '..', '..', '..', 'server')),
      memoryLimitMiB: 256,
      logging: LogDriver.awsLogs({ streamPrefix: 'chapter3' }),
    });

    this.container.addPortMappings({
      containerPort: 80,
      protocol: Protocol.TCP,
    });

    this.service = new FargateService(scope, 'Service', {
      cluster: this.cluster,
      taskDefinition: this.task_definition,
    });

    this.load_balancer = new ApplicationLoadBalancer(scope, 'LB', {
      vpc: this.vpc,
      internetFacing: true,
    });

    this.listener = this.load_balancer.addListener('PublicListener', { port: 80, open: true });

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
        path: '/healthcheck',
        timeout: Duration.seconds(5),
      },
    });

    props.dynamodb.main_table.grantReadWriteData(this.task_definition.taskRole);

    new CfnOutput(scope, 'BackendURL', { value: this.load_balancer.loadBalancerDnsName });
  }
}
