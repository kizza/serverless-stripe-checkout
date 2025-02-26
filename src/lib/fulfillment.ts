import Stripe from "stripe";
import { v5 } from "uuid";
import { Processed } from "../stripe/checkout";
import { lookupPurchase, persistPurchase } from "./persistence";
import { send as sendEmail } from "./email";
import { trace } from "../util";

export const deriveInternalId = (email: string) =>
  v5(email, "a3980a6a-c2f5-4ba1-89eb-335abf31c844");

export const fulfillCheckoutSession = (by: "request" | "webhook") => async (checkoutSession: Processed<Stripe.Checkout.Session>) => {
  trace(`Fulfilling by ${by}`, checkoutSession)
  const {
    payment_intent: { id: purchaseId, created: createdAt },
    customer_details: { email, name }
  } = checkoutSession;

  const internalId = deriveInternalId(email!)
  const purchaseData = {
    internalId,
    purchaseId,
    createdAt,
    fulfilledBy: by,
    name: name || "",
    email: email || "",
    updatedAt: 0, // updated when persisted
  }
  console.log("purchaseData", purchaseData)

  const existing = await lookupPurchase(internalId, purchaseId)
  if (!existing) {
    console.log("New fulfillment", purchaseData)
    await sendEmail()
    await persistPurchase(purchaseData)
  } else {
    console.log(`Already fulfilled by ${existing}`)
  }
  return checkoutSession
}

