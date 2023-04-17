/* ---------- External Libraries ---------- */
import { SecretValue, Tags } from 'aws-cdk-lib';
import { Artifact, Pipeline } from 'aws-cdk-lib/aws-codepipeline';
import { Construct } from 'constructs';
import {
  CodeBuildAction,
  GitHubSourceAction,
  GitHubTrigger,
} from 'aws-cdk-lib/aws-codepipeline-actions';
import {
  BuildSpec,
  LinuxBuildImage,
  PipelineProject,
} from 'aws-cdk-lib/aws-codebuild';

import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { SlackChannelConfiguration } from 'aws-cdk-lib/aws-chatbot';
import { NotificationRule } from 'aws-cdk-lib/aws-codestarnotifications';
import { pipelineConfig } from '../../../utils/pipelineConfig';

interface Props {
  environment: string;
}

export class PipelineStack extends Construct {
  readonly frontEndTestProject: PipelineProject;

  readonly backEndTestProject: PipelineProject;

  readonly deployProject: PipelineProject;

  readonly pipeline: Pipeline;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);
    const {
      buildCommand,
      deployCommand,
      branch,
      tag,
      githubToken,
      workspaceId,
      channelId,
    } = pipelineConfig(props.environment);

    /* ---------- Pipeline Configs ---------- */
    const secretToken = new SecretValue(githubToken);

    const codeBuildPolicy = new PolicyStatement({
      sid: 'AssumeRole',
      effect: Effect.ALLOW,
      actions: ['sts:AssumeRole', 'iam:PassRole'],
      resources: [
        'arn:aws:iam::*:role/cdk-readOnlyRole',
        'arn:aws:iam::*:role/cdk-hnb659fds-lookup-role-*',
        'arn:aws:iam::*:role/cdk-hnb659fds-deploy-role-*',
        'arn:aws:iam::*:role/cdk-hnb659fds-file-publishing-*',
        'arn:aws:iam::*:role/cdk-hnb659fds-image-publishing-role-*',
      ],
    });

    /* ---------- Artifacts ---------- */
    const outputSource = new Artifact();

    /* ---------- Pipeline Build Projects ---------- */
    this.backEndTestProject = new PipelineProject(
      scope,
      `Chapter5-BackEndTest-PipelineProject-${props.environment}`,
      {
        projectName: `Chapter5-BackEndTest-PipelineProject-${props.environment}`,
        environment: {
          buildImage: LinuxBuildImage.fromCodeBuildImageId(
            'aws/codebuild/amazonlinux2-x86_64-standard:4.0',
          ),
        },
        buildSpec: BuildSpec.fromObject({
          version: '0.2',
          phases: {
            install: {
              'runtime-versions': {
                nodejs: '16',
              },
            },
            pre_build: {
              'on-failure': 'ABORT',
              commands: ['cd server/', 'yarn install'],
            },
            build: {
              'on-failure': 'ABORT',
              commands: ['echo Testing the Back-End...', 'yarn test'],
            },
          },
        }),
      },
    );

    this.deployProject = new PipelineProject(
      this,
      `Chapter5-BackEndBuild-PipelineProject-${props.environment}`,
      {
        projectName: `Chapter5-BackEndBuild-PipelineProject-${props.environment}`,
        environment: {
          privileged: true,
          buildImage: LinuxBuildImage.fromCodeBuildImageId(
            'aws/codebuild/amazonlinux2-x86_64-standard:4.0',
          ),
        },
        buildSpec: BuildSpec.fromObject({
          version: '0.2',
          phases: {
            install: {
              'runtime-versions': {
                nodejs: '16',
              },
            },
            pre_build: {
              'on-failure': 'ABORT',
              commands: [
                'cd web',
                'yarn install',
                'cd ../server',
                'yarn install',
                'cd ../infrastructure',
                'yarn install',
              ],
            },
            build: {
              'on-failure': 'ABORT',
              commands: [
                'cd ../web',
                `${buildCommand}`,
                'cd ../infrastructure',
                `${deployCommand}`,
              ],
            },
            post_build: {
              'on-failure': 'ABORT',
              commands: [''],
            },
          },
        }),
      },
    );

    // adding the necessary permissions in order to synthesize and deploy the cdk code.
    this.deployProject.addToRolePolicy(codeBuildPolicy);

    this.frontEndTestProject = new PipelineProject(
      scope,
      `Chapter5-FrontEndTest-PipelineProject-${props.environment}`,
      {
        projectName: `Chapter5-FrontEndTest-PipelineProject-${props.environment}`,
        environment: {
          buildImage: LinuxBuildImage.fromCodeBuildImageId(
            'aws/codebuild/amazonlinux2-x86_64-standard:4.0',
          ),
        },
        buildSpec: BuildSpec.fromObject({
          version: '0.2',
          phases: {
            install: {
              'runtime-versions': {
                nodejs: '16',
              },
            },
            pre_build: {
              'on-failure': 'ABORT',
              commands: ['cd web/', 'yarn install'],
            },
            build: {
              'on-failure': 'ABORT',
              commands: ['echo Testing the Front-End...', 'yarn test'],
            },
          },
        }),
      },
    );

    /* ---------- Pipeline ---------- */
    this.pipeline = new Pipeline(
      scope,
      `BackendTest-Pipeline-${props.environment}`,
      {
        pipelineName: `Chapter5-Pipeline-${props.environment}`,
      },
    );

    /* ---------- Stages ---------- */
    this.pipeline.addStage({
      stageName: 'Source',
      actions: [
        new GitHubSourceAction({
          actionName: 'Source',
          owner: 'westpoint-io',
          repo: 'AWS-CDK-in-Action-Chapter-5',
          branch: `${branch}`,
          oauthToken: secretToken,
          output: outputSource,
          trigger: GitHubTrigger.WEBHOOK,
        }),
      ],
    });

    this.pipeline.addStage({
      stageName: 'Back-End-Test',
      actions: [
        new CodeBuildAction({
          actionName: 'Back-End-Test',
          project: this.backEndTestProject,
          input: outputSource,
          outputs: undefined,
        }),
      ],
    });

    this.pipeline.addStage({
      stageName: 'Front-End-Test',
      actions: [
        new CodeBuildAction({
          actionName: 'Front-End-Test',
          project: this.frontEndTestProject,
          input: outputSource,
          outputs: undefined,
        }),
      ],
    });

    this.pipeline.addStage({
      stageName: 'Build-and-Deploy',
      actions: [
        new CodeBuildAction({
          actionName: 'Build-and-Deploy-Front-and-Back-End',
          project: this.deployProject,
          input: outputSource,
          outputs: undefined,
        }),
      ],
    });

    const snsTopic = new Topic(
      this,
      `${props.environment}-Pipeline-SlackNotificationsTopic`,
    );

    const slackConfig = new SlackChannelConfiguration(this, 'SlackChannel', {
      slackChannelConfigurationName: `${props.environment}-Pipeline-Slack-Channel-Config`,
      slackWorkspaceId: workspaceId || '',
      slackChannelId: channelId || '',
    });

    const rule = new NotificationRule(this, 'NotificationRule', {
      source: this.pipeline,
      events: [
        'codepipeline-pipeline-pipeline-execution-failed',
        'codepipeline-pipeline-pipeline-execution-canceled',
        'codepipeline-pipeline-pipeline-execution-started',
        'codepipeline-pipeline-pipeline-execution-resumed',
        'codepipeline-pipeline-pipeline-execution-succeeded',
        'codepipeline-pipeline-manual-approval-needed',
      ],
      targets: [snsTopic],
    });

    rule.addTarget(slackConfig);

    /* ---------- Tags ---------- */
    Tags.of(this).add('Context', `${tag}`);
  }
}
