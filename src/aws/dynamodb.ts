import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

const dbClient = new DynamoDBClient({ region: "us-east-1" });
const documentClient = DynamoDBDocumentClient.from(dbClient);

export const qyeryExpression = (
  tableName: string,
  expression: string,
  attributes: Record<string, string>
) =>
  documentClient.send(new QueryCommand({
    TableName: tableName,
    KeyConditionExpression: expression,
    ExpressionAttributeValues: attributes,
  }));

export const timestamp = () => new Date().getTime();

export const put = async <T>(tableName: string, data: T) =>
  documentClient.send(new PutCommand({
    TableName: tableName,
    Item: {...data, updatedAt: timestamp()}
  }))
    .then(response => {
      console.log("DB put response", response);
    })
    .then(() => data);

