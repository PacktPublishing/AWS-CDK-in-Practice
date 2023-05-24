import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib/core';
import { Instance, InstanceType, AmazonLinuxImage, Vpc, IVpc } from 'aws-cdk-lib/aws-ec2';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class MyAppStack extends Stack {
  public readonly bucket: Bucket;

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
          instanceType: new InstanceType(i % 2 ? 't2.large' : 't2.micro'),
          machineImage: new AmazonLinuxImage(),
          vpc: this.default_vpc,
        }),
    );

    this.bucket = new Bucket(this, 'MyBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
    });

    this.my_virtual_machines.forEach(virtual_machine => {
      this.bucket.grantRead(virtual_machine);
    });
  }
}
