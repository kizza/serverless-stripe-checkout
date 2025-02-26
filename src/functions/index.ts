import { APIGatewayProxyHandler } from "aws-lambda";

export const handler: APIGatewayProxyHandler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Your function is running for stage ${process.env.STAGE}!`,
      input: event,
    })
  };
};
