import { SNSClient } from "@aws-sdk/client-sns";
import { publishToTopic } from "../../src/aws/sns";

describe("sns", () => {
  it("works", async () => {
    jest
      .spyOn(SNSClient, "send")
      .mockImplementation((_command: any): SNSClient => {
        return Promise.resovle("foo")
      })

    publishToTopic("Message", "arn")
      .then(() => {
        //
      })
      .catch(e => {
        expect(e.statusCode).toEqual(500)
      })
  })
})
