import { stringify } from "querystring"
import { asError, parseFormData, parseQueryParam, parseQueryParams } from "../../src/aws/gateway"
import { buildGatewayApiEvent } from "../builders"

describe("Gateway", () => {
  describe("asError", () => {
    it("encodes rejected promises", async () => {
      const first = (input: any) => Promise.resolve(input)
      const second = (input: any) => new Promise((resolve, reject) => {
        try {
          resolve(JSON.parse(input))
        } catch (e) {
          reject(e)
        }
      })

      return first("Not JSON")
        .then(second)
        .catch(asError("Foo"))
        .then((result: any) => {
          expect(result.statusCode).toEqual(500)
          expect(JSON.parse(result.body).message).toEqual("Foo error: Unexpected token N in JSON at position 0")
        })
    })
  })

  describe("parseQueryParam", () => {
    it("parses params correctly", async () => {
      const gatewayEvent = buildGatewayApiEvent({
        queryStringParameters: {
          description: "Description",
        }
      });

      const parsed = parseQueryParam(gatewayEvent, "description")
      expect(parsed).toEqual("Description")
    })
  })

  describe("parseQueryParams", () => {
    it("parses params correctly", async () => {
      const gatewayEvent = buildGatewayApiEvent({
        queryStringParameters: {
          "item[]": "book,shirt",
        }
      });

      const parsed = parseQueryParams(gatewayEvent, "item[]")
      expect(parsed).toEqual(["book", "shirt"])
    })
  })

  describe("parseFormData", () => {
    it("parses form data correctly", async () => {
      const formData = {
        description: "Description",
        "item[]": ["book", "shirt"],
      }
      const formEncoded = stringify(formData);
      const base64Encoded = Buffer.from(formEncoded).toString('base64');

      const gatewayEvent = buildGatewayApiEvent({
        body: base64Encoded,
        isBase64Encoded: true,
        httpMethod: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });

      const parsed = parseFormData<Record<string, any>>(gatewayEvent)
      expect(parsed.description).toEqual("Description")
      expect(parsed.items).toEqual(["book", "shirt"])
    })

    it("parses form data correctly", async () => {
      const formData = {
        "description": "Description",
        "item[0][code]": "price_1",
        "item[0][quantity]": "1",
        "item[1][code]": "price_2",
        "item[1][quantity]": "2",
      }
      const formEncoded = stringify(formData);
      const base64Encoded = Buffer.from(formEncoded).toString('base64');

      const gatewayEvent = buildGatewayApiEvent({
        body: base64Encoded,
        isBase64Encoded: true,
        httpMethod: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });

      const parsed = parseFormData<Record<string, any>>(gatewayEvent)
      expect(parsed.description).toEqual("Description")
      expect(parsed.items).toEqual([
        {code: "price_1", quantity: "1"},
        {code: "price_2", quantity: "2"},
      ])
    })
  })
})
