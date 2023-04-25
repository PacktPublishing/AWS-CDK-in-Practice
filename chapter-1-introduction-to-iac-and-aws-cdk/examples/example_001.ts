import { Stack, StackProps } from 'aws-cdk-lib/core';
import { Instance, InstanceType, AmazonLinuxImage, Vpc, IVpc } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class MyAppStack extends Stack {
  public readonly default_vpc: IVpc;

  public readonly my_virtual_machine: Instance;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.default_vpc = Vpc.fromLookup(this, 'VPC', {
      // This will get the default account VPC
      isDefault: true,
    });

    this.my_virtual_machine = new Instance(this, 'single-intance', {
      // The type of instance to deploy (e.g. a 't2.micro')
      instanceType: new InstanceType('t2.micro'),
      // The type of image to use for the instance
      machineImage: new AmazonLinuxImage(),
      // A reference to the object representing the VPC
      vpc: this.default_vpc,
    });
  }
}
