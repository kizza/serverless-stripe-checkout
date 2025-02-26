import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda";
import { asBoolean, asError, asRedirect, parseFormData } from "../aws/gateway";
import { Catalogue, catalogue } from "../stripe/catalogue";
import { CreateCheckoutSession, createCheckoutSession } from "../stripe/checkout";
import { trace } from "../util";

export interface Payload {
  description: string;
  successPath: string;
  cancelPath: string;
  currency?: string;
  // items: Array<keyof Catalogue>;
  items: {
    code: string;
    quantity: number;
    adjustableQuantity?: boolean;
    adjustableQuantityMinimum?: number;
    adjustableQuantityMaximum?: number;
  }[]
  coupons?: string[];
  shippingRates?: string[];
}

const parseInput = (event: APIGatewayProxyEvent) => {
  trace("Event", event)
  const formData = parseFormData<Payload>(event)
  trace("formData", formData)
  return Promise.resolve(formData)
}

const validateInput = (input: Payload): Payload => {
  if (!input.items || input.items.length == 0) throw new Error("No items provided")

  // const invalidItems = input.items.filter(item => catalogue[item] == undefined)
  // if (invalidItems.length > 0) throw new Error(`Invalid items provided (${invalidItems.join(", ")})`)

  return input;
}

const resolveItems = (input: Payload): CreateCheckoutSession => ({
  successPath: input.successPath,
  cancelPath: input.cancelPath,
  description: input.description,
  currency: input.currency || "",
  items: input.items.map(item => ({
    price: item.code,
    quantity: item.quantity || 1,
    adjustable_quantity: {
      enabled: asBoolean(item.adjustableQuantity),
      minimum: Number(item.adjustableQuantityMinimum) || undefined,
      maximum: Number(item.adjustableQuantityMaximum) || undefined,
    },
  })),
  discounts: [
    ...(input.coupons || []).map(coupon => ({ coupon }))
  ],
  shippingOptions: [
    ...(input.shippingRates || []).map(shippingRate => ({ shipping_rate: shippingRate  }))
  ],
})

const logResponse = <T>(response: T) => {
  // console.log("Got back ", response)
  return response;
}

const redirectToCheckout = (input: Awaited<ReturnType<typeof createCheckoutSession>>) => {
  if (!input.url) throw new Error("Checkout url not found")
  trace("Redirecting with", input)
  return asRedirect(input.url)
}

export const handler: APIGatewayProxyHandler = async (event) =>
  parseInput(event)
    .then(validateInput)
    .then(resolveItems)
    .then(createCheckoutSession)
    .then(logResponse)
    .then(redirectToCheckout)
    .catch(asError("createCheckoutSession"))
