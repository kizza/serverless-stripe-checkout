import Stripe from "stripe";
import { withStripe } from "../stripe";
// import countries from "../stripe/countries";

export interface CreateCheckoutSession {
  successPath: string
  cancelPath: string
  items: Stripe.Checkout.SessionCreateParams.LineItem[]
  currency: string
  description?: string
  discounts?: Array<Stripe.Checkout.SessionCreateParams.Discount>;
  shippingOptions?: Array<{ shipping_rate: string}>; // Array<Stripe.Checkout.SessionCreateParams.ShippingOption>;
}

export const createCheckoutSession = ({
  successPath,
  cancelPath,
  currency,
  items,
  discounts,
  shippingOptions,
  description = "",
}: CreateCheckoutSession) => {
  const attributes = {
    currency: currency,
    line_items: items,
    discounts: discounts,
    shipping_options: shippingOptions,
    metadata: { description },
    billing_address_collection: "required",
    shipping_address_collection: {
      allowed_countries: ["AU"],
    },
    // payment_method_types: ["card"],
    mode: "payment",
    success_url: `${process.env.WEBSITE_URL}/${successPath}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.WEBSITE_URL}/${cancelPath}`,
  } satisfies Stripe.Checkout.SessionCreateParams

  console.log("Checkout session", attributes)

  return withStripe(stripe =>
    stripe.checkout.sessions.create(attributes)
  )
}

export type Processed<T> = T & {
  payment_intent: Stripe.PaymentIntent,
  // customer: Stripe.Customer,
  customer_details: Stripe.Checkout.Session.CustomerDetails,
}

export const retrieveCheckoutSession = (sessionId: string) =>
  withStripe(
    (stripe: Stripe) =>
      stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["customer", "payment_intent", "line_items"],
      }) as Promise<Processed<Stripe.Checkout.Session>>
  );

