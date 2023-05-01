export interface IHttpResponse {
  body: string;
  headers: {
    'Access-Control-Allow-Origin': string;
    'Content-Type': string;
    'Access-Control-Allow-Headers': string;
    'Access-Control-Allow-Methods': string;
    'X-Requested-With': string;
  };
  statusCode: number;
}

export const httpResponse = (
  statusCode: number,
  body: string,
): IHttpResponse => ({
  body,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Access-Control-Allow-Headers':
      'Content-Type,X-Amz-Date,X-Amz-Security-Token,Authorization,X-Api-Key,X-Requested-With,Accept,Access-Control-Allow-Methods,Access-Control-Allow-Origin,Access-Control-Allow-Headers',
    'Access-Control-Allow-Methods': 'GET,OPTIONS,POST',
    'X-Requested-With': '*',
  },
  statusCode,
});
