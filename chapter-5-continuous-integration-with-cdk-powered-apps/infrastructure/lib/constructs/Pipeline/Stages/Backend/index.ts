import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Chapter5Stack } from '../../../../chapter-5-stack';

interface Props extends StageProps {
  environment: 'Production' | 'Test' | 'Development';
}

export class BackendStage extends Stage {
  readonly stack: Chapter5Stack;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);

    this.stack = new Chapter5Stack(this, `Chapter5Stack-${props.environment}`);
  }
}
