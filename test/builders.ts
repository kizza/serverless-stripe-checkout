// import { SqsMessage, HydratedCheckoutSession } from "../src/models";
import { SQSRecord, APIGatewayEvent } from "aws-lambda";
import { stringify } from "querystring";

// export const buildSqsRecord = (message: Partial<SqsMessage>) =>
//   ({
//     body: JSON.stringify({
//       Message: {
//         correlationId: "foo",
//         checkoutSessionId: "bar",
//         ...message,
//       },
//     }),
//   } as SQSRecord);

export const buildGatewayApiEvent = (overrides?: Partial<APIGatewayEvent>) =>
  ({...overrides} as APIGatewayEvent);


export const buildFormData = (data: Record<string, any>) =>
  Buffer.from(stringify(data)).toString('base64');

