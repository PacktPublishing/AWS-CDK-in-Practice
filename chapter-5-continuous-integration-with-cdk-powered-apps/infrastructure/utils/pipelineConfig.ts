import * as dotenv from 'dotenv';
import config from '../../config.json';

const webConfigJSON = {
  domainName: config.domain_name,
  backendSubdomain: config.backend_subdomain,
  frontendSubdomain: config.frontend_subdomain,
  backendDevSubdomain: config.backend_dev_subdomain,
  frontendDevSubdomain: config.frontend_dev_subdomain,
};

export const pipelineConfig = (env: string) => {
  if (env === 'Production') {
    const { parsed } = dotenv.config({ path: '.env.production' });

    return {
      buildCommand: 'yarn build:prod',
      deployCommand: 'yarn cdk deploy',
      branch: 'master',
      tag: 'chapter5-production-pipeline',
      githubToken: parsed?.GITHUB_TOKEN,
      workspaceId: parsed?.WORKSPACE_ID,
      channelId: parsed?.CHANNEL_ID,
      ...webConfigJSON,
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
    ...webConfigJSON,
  };
};
