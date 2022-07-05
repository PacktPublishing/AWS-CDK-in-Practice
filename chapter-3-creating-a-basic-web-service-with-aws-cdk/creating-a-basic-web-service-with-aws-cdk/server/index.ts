import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  PutCommandInput,
  QueryCommand,
  QueryCommandInput,
} from '@aws-sdk/lib-dynamodb';

import { accessKeyId, region, secretAccessKey } from './config.json';

const app = express();
const port = process.env.PORT || 80;

/* ----------
 * DynamoDB Client (AWS SDK) for Node.js
 * ---------- */
const ddbClient = new DynamoDBClient({ region, credentials: { accessKeyId, secretAccessKey } });

const marshallOptions = {
  convertEmptyValues: false,
  removeUndefinedValues: true,
};

const dynamodb = DynamoDBDocumentClient.from(ddbClient, { marshallOptions });
/* ----------
 * DynamoDB Client (AWS SDK) for Node.js
 * ---------- */

app.use(cors());
app.use(express.json());

app.post('/', async (req, res) => {
  const { name, description, completed } = req.body.todo;

  const todo = {
    sort_key: uuidv4(),
    partition_key: 'todo',
    name,
    description,
    completed,
  };

  const params: PutCommandInput = {
    TableName: 'main_table',
    Item: todo,
  };

  const command = new PutCommand(params);

  await dynamodb.send(command);

  res.status(200).send({
    todo,
  });
});

app.get('/', async (_, res) => {
  const params: QueryCommandInput = {
    TableName: 'main_table',
    ExpressionAttributeNames: {
      '#pk': 'partition_key',
    },
    ExpressionAttributeValues: {
      ':pk': 'todo',
    },
    KeyConditionExpression: '#pk = :pk',
  };

  const command = new QueryCommand(params);

  const { Items } = await dynamodb.send(command);

  res.status(200).send({
    todos: Items,
  });
});

app.listen(port);
