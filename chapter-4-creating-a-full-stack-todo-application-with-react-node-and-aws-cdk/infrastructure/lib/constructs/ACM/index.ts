import { DnsValidatedCertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { IHostedZone } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

interface Props {
  hosted_zone: IHostedZone;
}

export class ACM extends Construct {
  public readonly certificate: DnsValidatedCertificate;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const { domain_name } = this.node.tryGetContext('environment');

    this.certificate = new DnsValidatedCertificate(scope, 'Certificate', {
      domainName: domain_name,
      region: 'us-east-1',
      hostedZone: props.hosted_zone,
      subjectAlternativeNames: ['*.westpoint.io'],
    });
  }
}
