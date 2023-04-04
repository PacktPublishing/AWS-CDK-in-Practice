import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { OkPacket } from 'mysql';

import { Todo } from './@types';

import { execute, init } from './connections';

dotenv.config();

const port = process.env.PORT || 80;

const createApp = () => {
  const app = express();

  init();

  app.use(cors());
  app.use(express.json());

  app.post('/', async (req, res) => {
    try {
      const { todo_name, todo_description, todo_completed } = req.body.todo;

      const sql = `
      INSERT INTO Todolist
        (
          \`todo_name\`,
          \`todo_description\`,
          \`todo_completed\`
        )
        VALUES
          (
            "${todo_name}",
            "${todo_description}",
            ${todo_completed}
          );
    `;

      const response = await execute<OkPacket>(sql, {});

      const { insertId } = response;

      if (!insertId) return res.status(400).send('Failed to insert todo');

      const todo: Todo = {
        id: insertId,
        todo_completed,
        todo_description,
        todo_name,
      };

      return res.status(200).send({
        todo,
      });
    } catch (err: any) {
      console.log(err);

      return res.status(400).send({
        message: err.message,
      });
    }
  });

  app.get('/', async (_, res) => {
    try {
      const sql = `SELECT * FROM Todolist;`;

      const response = await execute<Todo>(sql, {});

      return res.status(200).send({ todos: response });
    } catch (err: any) {
      console.log(err);

      return res.status(400).send({
        message: err.message,
      });
    }
  });

  app.get('/health', async (_, res) => {
    return res.status(200).send({ status: 'available' });
  });

  return app;
};

const app = createApp();

const server = app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

server.keepAliveTimeout = 30000;
server.headersTimeout = 31000;

createApp();

export default createApp;
