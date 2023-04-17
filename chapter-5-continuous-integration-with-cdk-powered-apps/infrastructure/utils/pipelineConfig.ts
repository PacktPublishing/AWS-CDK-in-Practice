import * as dotenv from 'dotenv';

export const pipelineConfig = (env: string) => {
  if (env === 'Production') {
    const { parsed } = dotenv.config({ path: '.env.production' });

    return {
      buildCommand: 'yarn build:prod',
      deployCommand: 'yarn cdk deploy',
      branch: 'main',
      tag: 'chapter5-production-pipeline',
      githubToken: parsed?.GITHUB_TOKEN,
      workspaceId: parsed?.WORKSPACE_ID,
      channelId: parsed?.CHANNEL_ID,
    };
  }

  const { parsed } = dotenv.config({ path: '.env.development' });

  return {
    buildCommand: 'yarn build:dev',
    deployCommand: 'yarn cdk:dev deploy',
    branch: 'dev',
    tag: 'chapter5-development-pipeline',
    githubToken: parsed?.GITHUB_TOKEN,
    workspaceId: parsed?.WORKSPACE_ID,
    channelId: parsed?.CHANNEL_ID,
  };
};
