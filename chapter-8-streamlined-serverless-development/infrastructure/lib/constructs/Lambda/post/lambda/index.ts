import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { PostEvent, Todo } from 'customTypes/index';
import { httpResponse } from '../../handlers/httpResponse';

export const handler = async (event: PostEvent) => {
  try {
    const { todo_name, todo_description, todo_completed } = JSON.parse(
      event.body,
    ).todo;
    const tableName = process.env.TABLE_NAME as string;
    const awsRegion = process.env.REGION || 'us-east-1';

    const dynamoDB = new DynamoDB.DocumentClient({
      region: awsRegion,
      endpoint:
        process.env.DYNAMODB_ENDPOINT ||
        `https://dynamodb.${awsRegion}.amazonaws.com`,
    });

    const todo: Todo = {
      id: uuidv4(),
      todo_completed,
      todo_description,
      todo_name,
    };

    await dynamoDB.put({ TableName: tableName, Item: todo }).promise();

    return httpResponse(200, JSON.stringify({ todo }));
  } catch (error: any) {
    console.error(error);

    return httpResponse(400, JSON.stringify({ message: error.message }));
  }
};
