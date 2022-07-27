import express from 'express';
import cors from 'cors';
import { OkPacket } from 'mysql';

import { Todo } from './@types';

import { execute, init } from './connections';

const app = express();
const port = process.env.PORT || 80;

init();

app.use(cors());
app.use(express.json());

app.post('/', async (req, res) => {
  const { name, description, completed } = req.body;

  const sql = `
    INSERT INTO Todolist
      (
        \`todo_name\`,
        \`todo_description\`,
        \`todo_completed\`
      )
      VALUES
        (
          '${name}',
          '${description}',
          ${completed}
        );
  `;

  const response = await execute<OkPacket>(sql, {});

  const { insertId } = response;

  if (!insertId) return res.status(400).send('Failed to insert todo');

  const todo: Todo = {
    id: insertId,
    todo_completed: completed,
    todo_description: description,
    todo_name: name,
  };

  return res.status(200).send({
    todo,
  });
});

app.get('/', async (_, res) => {
  const sql = `SELECT * FROM Todolist;`;

  const response = await execute<Todo>(sql, {});

  res.status(200).send({ todos: response });
});

app.listen(port);
