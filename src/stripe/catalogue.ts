import Stripe from "stripe";

export type Catalogue = Record<string, CatalogueItem>
export type CatalogueItem = Stripe.Checkout.SessionCreateParams.LineItem

export const catalogue: Catalogue = {
  book: {
    price: process.env.CATALOGUE_BOOK,
    quantity: 1,
    adjustable_quantity: {
      enabled: true,
    },
  },
  twoBooks: {
    price: process.env.CATALOGUE_BOOK,
    quantity: 1,
    adjustable_quantity: {
      enabled: true,
    },
  }
}
