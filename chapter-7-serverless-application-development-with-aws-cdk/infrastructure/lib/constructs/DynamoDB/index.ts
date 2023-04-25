/* ---------- External Libraries ---------- */
import { RemovalPolicy } from 'aws-cdk-lib';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { DynamoDBSeeder, Seeds } from '@cloudcomponents/cdk-dynamodb-seeder';
import { v4 as uuidv4 } from 'uuid';

export class DynamoDB extends Construct {
  readonly table: Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.table = new Table(this, `Dynamo-Table-${process.env.NODE_ENV || ''}`, {
      partitionKey: { name: 'id', type: AttributeType.STRING },
      tableName: `todolist-${process.env.NODE_ENV?.toLowerCase() || ''}`,
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    new DynamoDBSeeder(
      this,
      `Dynamo-InlineSeeder-${process.env.NODE_ENV || ''}`,
      {
        table: this.table,
        seeds: Seeds.fromInline([
          {
            id: uuidv4(),
            todo_name: 'First todo',
            todo_description: "That's a todo for demonstration purposes",
            todo_completed: true,
          },
        ]),
      },
    );
  }
}
