/* ---------- External libraries ---------- */
import { Stack, StackProps, Tags } from 'aws-cdk-lib';
import { IRepository } from 'aws-cdk-lib/aws-ecr';
import { IBaseService } from 'aws-cdk-lib/aws-ecs';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

/* ---------- Constructs ---------- */
import { PipelineStack } from './constructs/Pipeline/index';

interface PipelineProps extends StackProps {
  bucket?: IBucket;
  repository?: IRepository;
  expressAppService?: IBaseService;
}

export class Chapter8PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: PipelineProps) {
    super(scope, id, props);

    /* ---------- Constructs ---------- */
    new PipelineStack(this, 'Chapter8-Pipeline-Prod', {
      environment: 'Production',
    });

    new PipelineStack(this, 'Chapter8-Pipeline-Dev', {
      environment: 'Development',
    });

    /* ---------- Tags ---------- */
    Tags.of(scope).add('Project', 'Chapter8-Pipeline');
  }
}
