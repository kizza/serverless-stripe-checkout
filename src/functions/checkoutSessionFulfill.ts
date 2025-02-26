import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda";
import { asError, asJson } from "../aws/gateway";
import { fulfillCheckoutSession } from "../lib/fulfillment";
import { retrieveCheckoutSession } from "../stripe/checkout";
import { trace } from "../util";

const parseInput = (event: APIGatewayProxyEvent) => {
  trace("Event", event)
  trace(process.env)
  const { id: checkoutSessionId } = event.pathParameters!; // Get the path parameter `{id}`
  if (!checkoutSessionId) throw new Error("No checkout session id")
  trace("checkoutSessionId", checkoutSessionId)
  return Promise.resolve(checkoutSessionId!)
}

const logResponse = <T>(response: T) => {
  // console.log("Got back ", response)
  return response;
}

const renderSession = (result: Awaited<ReturnType<typeof retrieveCheckoutSession>>) =>
  asJson(result)

export const handler: APIGatewayProxyHandler = async (event) =>
  parseInput(event)
    .then(retrieveCheckoutSession)
    .then(fulfillCheckoutSession("request"))
    .then(logResponse)
    .then(renderSession)
    .catch(asError("createCheckoutSession"))
