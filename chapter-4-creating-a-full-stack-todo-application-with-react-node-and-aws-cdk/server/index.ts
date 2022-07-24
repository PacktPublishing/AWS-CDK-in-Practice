import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const port = process.env.PORT || 80;

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

  res.status(200).send({
    todo,
  });
});

app.get('/', async (_, res) => {
  res.status(200).send({});
});

app.listen(port);
