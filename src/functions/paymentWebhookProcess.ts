import { SQSBatchResponse, SQSHandler, SQSRecord } from "aws-lambda";
import { QueueData } from "./paymentWebhookReceive";
import { retrieveCheckoutSession } from "../stripe/checkout";
import { fulfillCheckoutSession } from "../lib/fulfillment";
import { asError } from "../aws/gateway";
import { trace } from "../util";

const parseInput = (record: SQSRecord) => {
  trace("Record", record)
  trace(process.env)
  const message = JSON.parse(record.body).Message
  const data = JSON.parse(message) as QueueData
  trace("Data", data)
  const { checkoutSessionId } = data
  // if (!checkoutSessionId) throw new Error("No checkout session id")
  trace("checkoutSessionId", checkoutSessionId)
  return Promise.resolve(checkoutSessionId!)
}

const logResponse = <T>(response: T) => {
  console.log("Got back ", response)
  return response;
}

export const handler: SQSHandler = async (event) =>
  Promise.allSettled(
    event.Records.map(record =>
      parseInput(record)
        .then(retrieveCheckoutSession)
        .then(fulfillCheckoutSession("webhook"))
        .then(logResponse)
        .catch(asError("paymentWebhookProcess"))
    )
  ).then(() => {
    // void
  })
