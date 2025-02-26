import Stripe from "stripe";
import { buildGatewayApiEvent } from "../../test/builders";
import { createCheckoutSession, CreateCheckoutSession } from "../../src/stripe/checkout"
import { mockStripe } from "../mocks/stripe";
import checkoutFixture from "../fixtures/createCheckoutSessionResponse.js"
// import { handle, CreateSessionDto } from "./../createCheckoutSession";

describe("Creating checkout session", () => {
  const lineItems = [
    {
      price: "price_1PSVMJFbHwwHDg3D4N6fdTRi",
      quantity: 1,
      adjustable_quantity: {
        enabled: true,
      },
    },
  ];

  describe("happy path", () => {
    it("returns a checkout session", async () => {
      const checkoutSessionId = "abcdef";

      const checkout: CreateCheckoutSession = {
        description: "foo",
        items: lineItems,
      };

      // const gatewayEvent = buildGatewayApiEvent({
      //   body: JSON.stringify(dto),
      // });

      const stripeMock = mockStripe({
        checkout: {
          sessions: {
            create: ({
              metadata,
              line_items,
              success_url,
              cancel_url,
            }: any) => {
              expect(metadata).toEqual({ description: checkout.description });
              expect(line_items).toEqual(lineItems);
              expect(success_url).toContain(
                `success?session_id={CHECKOUT_SESSION_ID}`
              );
              expect(cancel_url).toContain("cancel");

              return Promise.resolve({
                ...checkoutFixture,
                id: checkoutSessionId,
              } as Stripe.Checkout.Session);
            },
          },
        },
      });

      const response = await createCheckoutSession(checkout);
      console.log(response)
      expect(response.status).toEqual(200);
      expect(JSON.parse(response.body).id).toEqual(checkoutSessionId);

      stripeMock.mockRestore();
    });
  });

  // describe("sad path", () => {
  //   it("returns 500 with bad input", async () => {
  //     const gatewayEvent = buildGatewayApiEvent({
  //       body: "foo",
  //     });

  //     const response = await handle(gatewayEvent);
  //     expect(response.statusCode).toEqual(500);
  //     expect(response.body).toContain("Could not parse");
  //   });

  //   it("returns 500 when stripe errors", async () => {
  //     const gatewayEvent = buildGatewayApiEvent({
  //       body: JSON.stringify(lineItems),
  //     });

  //     const stripeMock = mockStripe({
  //       checkout: {
  //         sessions: {
  //           create: () => {
  //             throw new Error("AN_ERROR");
  //           },
  //         },
  //       },
  //     });

  //     const response = await handle(gatewayEvent);
  //     expect(response.statusCode).toEqual(500);
  //     expect(response.body).toContain("AN_ERROR");

  //     stripeMock.mockRestore();
  //   });
  // });
});

