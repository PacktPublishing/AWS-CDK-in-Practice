import { RemovalPolicy } from "aws-cdk-lib";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

// This is an interface we use to pass the environment as a variable to the construct
interface Props {
  environment: string;
}

export class S3Bucket extends Construct {
  public readonly bucket: Bucket;

  // Every construct needs to implement a constructor
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    this.bucket = new Bucket(scope, 'Bucket-S3', {
      // When the stack is deleted, the bucket should be destroyed
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }
}