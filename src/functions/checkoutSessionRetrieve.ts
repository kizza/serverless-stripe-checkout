import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda";
import { asError, asJson } from "../aws/gateway";
import { retrieveCheckoutSession } from "../stripe/checkout";

const parseInput = (event: APIGatewayProxyEvent) => {
  console.log("Event", event)
  const { id: checkoutSessionId } = event.pathParameters!; // Get the path parameter `{id}`
  if (!checkoutSessionId) throw new Error("No checkout session id")
  console.log("checkoutSessionId", checkoutSessionId)
  return Promise.resolve(checkoutSessionId!)
}

const logResponse = <T>(response: T) => {
  console.log("Got back ", response)
  return response;
}

const renderSession = (result: Awaited<ReturnType<typeof retrieveCheckoutSession>>) =>
  asJson(result)

export const handler: APIGatewayProxyHandler = async (event) =>
  parseInput(event)
    .then(retrieveCheckoutSession)
    .then(logResponse)
    .then(renderSession)
    .catch(asError("retrieveCheckoutSession"))
