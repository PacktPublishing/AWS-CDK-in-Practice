import supertest from 'supertest';
import createApp from '../index';

const app = createApp();

const healthPathResult = {
  status: 'available',
};

describe('health check route', () => {
  it('Should return status 200 and message: {status: "available"}', async () => {
    const { body, statusCode } = await supertest(app).get('/health');

    expect(statusCode).toBe(200);
    expect(body).toEqual(healthPathResult);
  });
});
