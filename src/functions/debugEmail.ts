import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda";
import { asError, asJson } from "../aws/gateway";
import { send as sendEmail } from "../lib/email";

const parseInput = (event: APIGatewayProxyEvent) => {
  console.log("Event", event)
  return Promise.resolve()
}

const logResponse = <T>(response: T) => {
  console.log("Got back ", response)
  return response;
}

const renderSession = () =>
  asJson({all: "done"})

export const handler: APIGatewayProxyHandler = async (event) =>
  parseInput(event)
    .then(sendEmail)
    .then(logResponse)
    .then(renderSession)
    .catch(asError("retrieveCheckoutSession"))
