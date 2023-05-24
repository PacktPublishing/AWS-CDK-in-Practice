import { httpResponse } from '../../handlers/httpResponse';

export const handler = async () => {
  try {
    return httpResponse(200, JSON.stringify('OK'));
  } catch (error: any) {
    console.error(error);

    return httpResponse(400, JSON.stringify({ message: error.message }));
  }
};
