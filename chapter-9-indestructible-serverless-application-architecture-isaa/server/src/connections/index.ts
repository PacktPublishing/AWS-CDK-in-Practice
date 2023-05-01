import mysql, { Pool } from 'mysql';
import dotenv from 'dotenv';
import {
  GetSecretValueCommand,
  GetSecretValueCommandInput,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';

dotenv.config();

let pool: Pool;

const secrets = new SecretsManagerClient({
  region: 'us-east-1',
});

const getSecretValue = async (secretId: string) => {
  const params: GetSecretValueCommandInput = {
    SecretId: secretId,
  };

  const command = new GetSecretValueCommand(params);

  const { SecretString } = await secrets.send(command);

  if (!SecretString) throw new Error('SecretString is empty');

  return JSON.parse(SecretString);
};

export const init = () => {
  console.log(
    'SecretId: ',
    `chapter-5/rds/my-sql-instance-${process.env.NODE_ENV}`,
  );
  getSecretValue(`chapter-5/rds/my-sql-instance-${process.env.NODE_ENV}`)
    .then(({ password, username, host }) => {
      pool = mysql.createPool({
        host,
        user: username,
        password,
        multipleStatements: true,
        port: 3306,
        database: 'todolist',
      });

      return pool;
    })
    .catch(error => {
      console.log(error);

      return 0;
    });
};

export const execute = <T>(
  query: string,
  params: string[] | Record<string, unknown>,
): Promise<T> => {
  try {
    if (!pool)
      throw new Error(
        'Pool was not created. Ensure pool is created when running the app.',
      );

    return new Promise<T>((resolve, reject) => {
      pool.query(query, params, (error, results) => {
        if (error) {
          console.log(error);
          reject(process.exit(1));
        } else resolve(results);
      });
    });
  } catch (error) {
    console.error('[mysql.connector][execute][Error]: ', error);
    throw new Error('failed to execute MySQL query');
  }
};
