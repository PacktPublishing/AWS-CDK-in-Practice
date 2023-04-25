import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import { handler as PostHandler } from '../../infrastructure/lib/constructs/Lambda/post/lambda';
import { handler as GetHandler } from '../../infrastructure/lib/constructs/Lambda/get/lambda';

const { parsed } = dotenv.config();

const port = parsed?.PORT || 80;

const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.post('/', async (req, res) => {
    const event = {
      body: JSON.stringify(req.body),
    };

    const { statusCode, body } = await PostHandler(event);

    return res.status(statusCode).send(body);
  });

  app.get('/', async (_req, res) => {
    const { statusCode, body } = await GetHandler();

    return res.status(statusCode).send(body);
  });

  app.get('/healthcheck', async (_req, res) => {
    return res.status(200).send(JSON.stringify('OK'));
  });

  return app;
};

const app = createApp();

const server = app.listen(port, () => {
  console.info(`Server is listening on port ${port}`);
});

server.keepAliveTimeout = 60;
server.headersTimeout = 60;

createApp();

export default createApp;
