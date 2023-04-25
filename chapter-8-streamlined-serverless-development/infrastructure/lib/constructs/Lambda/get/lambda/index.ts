import { DynamoDB } from 'aws-sdk';
import { httpResponse } from '../../handlers/httpResponse';

export const handler = async () => {
  try {
    const tableName = process.env.TABLE_NAME as string;
    const awsRegion = process.env.REGION || 'us-east-1';

    const dynamoDB = new DynamoDB.DocumentClient({
      region: awsRegion,
      endpoint:
        process.env.DYNAMODB_ENDPOINT ||
        `https://dynamodb.${awsRegion}.amazonaws.com`,
    });

    const { Items }: DynamoDB.ScanOutput = await dynamoDB
      .scan({ TableName: tableName })
      .promise();

    return httpResponse(200, JSON.stringify({ todos: Items }));
  } catch (error: any) {
    console.error(error);

    return httpResponse(400, JSON.stringify({ message: error.message }));
  }
};
