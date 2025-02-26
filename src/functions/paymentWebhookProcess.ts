import { SQSHandler } from "aws-lambda";

export const handler: SQSHandler = async (event) =>
  event.Records.forEach(record => {
    console.log(`Read "${JSON.parse(record.body).Message}"`)
  })
