import { HostedZone, IHostedZone } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

import config from '../../../../config.json';

export class Route53 extends Construct {
  public readonly hosted_zone: IHostedZone;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.hosted_zone = HostedZone.fromLookup(scope, 'HostedZone', {
      domainName: config.domain_name,
    });
  }
}
