export interface IHttpResponse {
  body: string;
  headers: {
    'Access-Control-Allow-Origin'?: string;
    'Content-Type'?: string;
    'Access-Control-Allow-Headers'?: string;
    'Access-Control-Allow-Methods': string;
    'X-Requested-With'?: string;
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
    'Access-Control-Allow-Methods': 'GET,OPTIONS,POST',
  },
  statusCode,
});
