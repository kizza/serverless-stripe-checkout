import { Callback, Context } from "aws-lambda";
import Stripe from "stripe";
import { Payload, handler } from "../../src/functions/checkoutSessionCreate";
import { buildFormData, buildGatewayApiEvent } from "../../test/builders";
import checkoutFixture from "../fixtures/createCheckoutSessionResponse.js";
import { mockStripe } from "../mocks/stripe";

describe("Creating checkout session", () => {
  describe("happy path", () => {
    it("returns a checkout session", async () => {
      const formData = {
        "currency": "AUD",
        "description": "Description",
        "item[0][code]": "price_TEST",
        "item[0][quantity]": "1",
        "coupon[]": "foo",
        "shippingRate[]": "foo",
        "successPath": "success",
        "cancelPath": "cancel",
      }

      const gatewayEvent = buildGatewayApiEvent({
        body: buildFormData(formData),
        isBase64Encoded: true,
        httpMethod: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });

      const stripeMock = mockStripe({
        checkout: {
          sessions: {
            create: ({
              currency,
              metadata,
              line_items,
              discounts,
              shipping_options,
              success_url,
              cancel_url,
            }: any) => {
              expect(currency).toEqual("AUD");
              expect(metadata).toEqual({ description: "Description" });
              expect(line_items[0].price).toEqual("price_TEST",);
              expect(discounts[0].coupon).toEqual("foo",);
              expect(shipping_options[0].shipping_rate).toEqual("foo",);
              expect(success_url).toContain(`success?session_id={CHECKOUT_SESSION_ID}`);
              expect(cancel_url).toContain("cancel");

              return Promise.resolve({
                ...checkoutFixture,
                id: "abcdef",
              } as Stripe.Checkout.Session);
            },
          },
        },
      });

      const response = await handler(gatewayEvent, {} as Context, {} as Callback)!
      expect(response.statusCode!).toEqual(302);
      expect(response.headers!["Location"]).toMatch(/^https:\/\/checkout.stripe.com/)

      stripeMock.mockRestore();
    });
  });

  describe("sad path", () => {
    it("returns 500 with invalid items", async () => {
      const gatewayEvent = buildGatewayApiEvent({body: "foo"});
      const response = await handler(gatewayEvent, {} as Context, {} as Callback)!
      expect(response.statusCode).toEqual(500);
      expect(response.body).toContain("No items provided");
    });

    it("returns 500 if session has no url to redirect to", async () => {
      const formData = {
        "currency": "AUD",
        "description": "Description",
        "item[0][code]": "price_TEST",
        "item[0][quantity]": "1",
        "coupon[]": "foo",
      }

      const gatewayEvent = buildGatewayApiEvent({
        body: buildFormData(formData),
        isBase64Encoded: true,
        httpMethod: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });

      const stripeMock = mockStripe({
        checkout: {
          sessions: {
            create: () => Promise.resolve({}),
          },
        },
      });

      const response = await handler(gatewayEvent, {} as Context, {} as Callback)!
      expect(response.statusCode).toEqual(500);
      expect(JSON.parse(response.body).message).toEqual("createCheckoutSession error: Checkout url not found");

      stripeMock.mockRestore();
    });

    it("returns 500 when stripe errors", async () => {
      const formData = {
        "currency": "AUD",
        "description": "Description",
        "item[0][code]": "price_TEST",
        "item[0][quantity]": "1",
        "coupon[]": "foo",
      }

      const gatewayEvent = buildGatewayApiEvent({
        body: buildFormData(formData),
        isBase64Encoded: true,
        httpMethod: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });

      const stripeMock = mockStripe({
        checkout: {
          sessions: {
            create: () => Promise.reject(new Error("Something happened")),
          },
        },
      });

      const response = await handler(gatewayEvent, {} as Context, {} as Callback)!
      expect(response.statusCode).toEqual(500);
      expect(JSON.parse(response.body).message).toEqual("createCheckoutSession error: Something happened");

      stripeMock.mockRestore();
    });
  });
});

