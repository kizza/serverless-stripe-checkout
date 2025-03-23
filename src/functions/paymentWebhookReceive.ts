import { APIGatewayEvent, APIGatewayProxyHandler } from "aws-lambda";
import Stripe from "stripe";
import { asError, asSuccess } from "../aws/gateway";
import { publishToTopic } from "../aws/sns";
import { withStripe } from "../stripe";
import { ContextualError, trace } from "../util";

const CHECKOUT_EVENTS = [
  "checkout.session.async_payment_failed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.completed",
  "checkout.session.expired",
] as const;

type SupportedStripEvents = typeof CHECKOUT_EVENTS[number]

export interface QueueData {
  correlationId: string
  checkoutSessionId: string
  checkoutSession: Stripe.Checkout.Session
}

const parseStripeEvent = (event: APIGatewayEvent): Promise<Stripe.Event> =>
  withStripe<Stripe.Event>(stripe =>
    new Promise((resolve, reject) => {
      try {
        trace("Gateway event", event)
        const stripeEvent = stripe.webhooks.constructEvent(
          event.body || "",
          event.headers["stripe-signature"]!,
          process.env.STRIPE_WEBHOOK_SECRET!
        );
        resolve(stripeEvent);
      } catch (e) {
        reject(new ContextualError("Error parsing stripe event", e));
      }
    })
  );

// const processStripeEvent = (event: Stripe.Event): HttpResponse | Promise<HttpResponse | void> => {
const processStripeEvent = (event: Stripe.Event) => {
  trace("Processing stripe event", event)
  switch (event.type as SupportedStripEvents) {
    case "checkout.session.completed":
      return handleCheckoutSucceeded(
        event.data.object as Stripe.Checkout.Session
      );

    case "checkout.session.async_payment_failed":
    case "checkout.session.async_payment_succeeded":
    case "checkout.session.expired":
      trace("Recieved", event.type)
      break;

    default:
      return Promise.reject({message: `Unsupported event ${event.type}`, statusCode: 400});
  }
};

const handleCheckoutSucceeded = async (checkoutSession: Stripe.Checkout.Session) => {
  const message = {
    correlationId: "an id",
    checkoutSessionId: checkoutSession.id,
    checkoutSession,
  } satisfies QueueData;

  console.log(`Handling checkout succeeded ${checkoutSession.id}`);
  return publishToTopic(JSON.stringify(message), process.env.WEBHOOK_TOPIC_ARN || "");
};

export const handler: APIGatewayProxyHandler = async (event) =>
  parseStripeEvent(event)
    .then(processStripeEvent)
    .then(asSuccess("Published"))
    .catch(asError("paymentWebhook"))
