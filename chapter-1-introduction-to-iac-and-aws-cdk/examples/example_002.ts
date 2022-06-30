import { Stack, StackProps } from 'aws-cdk-lib/core';
import { Instance, InstanceType, AmazonLinuxImage, Vpc, IVpc } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class MyAppStack extends Stack {
  public readonly default_vpc: IVpc;

  public readonly my_virtual_machines: Instance[];

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.default_vpc = Vpc.fromLookup(this, 'VPC', {
      isDefault: true,
    });

    this.my_virtual_machines = [...Array(100).keys()].map(
      i =>
        new Instance(this, `single-intance-${i}`, {
          instanceType: new InstanceType('t2.micro'),
          machineImage: new AmazonLinuxImage(),
          vpc: this.default_vpc,
        }),
    );
  }
}
