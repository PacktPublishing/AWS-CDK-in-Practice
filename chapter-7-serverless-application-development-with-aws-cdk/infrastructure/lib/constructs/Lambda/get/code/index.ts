import { DynamoDB, StepFunctions } from 'aws-sdk';
import { httpResponse } from '../../handlers/httpResponse';

export const handler = async () => {
  try {
    const tableName = process.env.TABLE_NAME as string;
    const dynamoDB = new DynamoDB.DocumentClient({
      region: process.env.REGION as string,
    });
    const stepFunctions = new StepFunctions({
      region: process.env.REGION as string,
    });

    const { Items }: DynamoDB.ScanOutput = await dynamoDB
      .scan({ TableName: tableName })
      .promise();

    await stepFunctions
      .startExecution({
        stateMachineArn: process.env.STATE_MACHINE_ARN as string,
        input: JSON.stringify({
          message: 'GET / route',
        }),
      })
      .promise();

    return httpResponse(200, JSON.stringify({ todos: Items }));
  } catch (error: any) {
    console.error(error);

    return httpResponse(400, JSON.stringify({ message: error.message }));
  }
};
