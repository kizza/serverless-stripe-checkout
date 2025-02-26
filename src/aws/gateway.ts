import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ContextualError, ensureArray, mapEntries, trace } from "../util";
import { parse } from "querystring";

// export interface Response<T> extends APIGatewayProxyResult {
//   statusCode: number;
//   headers?: Record<string, any>;
//   body: string;
// };

export const parseInput = <T>(event: APIGatewayProxyEvent): Promise<T> => new Promise((resolve, reject) => {
  try {
    resolve(JSON.parse(event.body!));
  } catch (e) {
    reject(new ContextualError("Could not parse input", e))
  }
})

// type QueryStringParam = {
//   (event: APIGatewayProxyEvent, name: `${string}[]`): string[];
//   (event: APIGatewayProxyEvent, name: string): string;
//   (event: APIGatewayProxyEvent, name: any): string | string[];
// };
export const parseQueryParam = (event: APIGatewayProxyEvent, name: string) => {
  const queryParams = event.queryStringParameters || {};
  return queryParams[name] || ""
}

export const pluraliseEntries = <T extends Record<string, any>>(object: T) => {
  return mapEntries(object, (key: string & keyof T, value: any) => {
    if (key.endsWith("[]")) {
      return [key.replace("[]", "s"), ensureArray(value)]
    } else {
      return [key, value]
    }
  })
}

const flattenNestedParameters = <T extends object>(obj: T) =>
  Object.entries(obj).reduce((acc, [key, value]) => {
    const match = key.match(/(\w+)\[(\d+)\]\[(\w+)\]/)
    if (match) {
      const [_full, record, childIndex, attribute] = match;
      const recordIndex = `${record}[]`

      acc[recordIndex] = acc[recordIndex] || [] // initialise child record if needed
      acc[recordIndex][childIndex] = {
        ...(acc[recordIndex]?.[childIndex] || {}), // existing attributes for child record
        [attribute]: value, // new attribute
      }
    } else {
      acc[key] = value
    }
    return acc;
  }, {} as any);

export const parseFormData = <T extends Record<string, any>>(event: APIGatewayProxyEvent) => {
  const rawBody = event.body || ""
  const decodedBody = event.isBase64Encoded ? Buffer.from(rawBody, "base64").toString("utf-8") : rawBody;
  const parsedBody = parse(decodedBody) as unknown as T
  const flattened = flattenNestedParameters(parsedBody) // ie. item[0][quantity] to item[] = { quantity }
  return pluraliseEntries(flattened) // ie. item[] to items
}

export const parseQueryParams = (event: APIGatewayProxyEvent, name: string) => {
  return parseQueryParam(event, name).split(",").filter(Boolean)
}

export const asBoolean = (input: unknown) => input === true || input === "true"

export const asJson = <T>(jsonable: T): APIGatewayProxyResult => ({
  statusCode: 200,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
  },
  body: JSON.stringify(jsonable),
});

export const asSuccess = (message: string) => (_: any): APIGatewayProxyResult => ({
  statusCode: 200,
  body: JSON.stringify({
    message,
  }),
});

export const asRedirect = (url: string): APIGatewayProxyResult => ({
  statusCode: 302,
  body: "",
  headers: {
    Location: url,
  },
});

export const asError = (context: string) => (e: any) => {
  const { message = "Unknown error", statusCode = 500 } = e;
  trace("asError: ", context, message, e)
  return {
    statusCode,
    body: JSON.stringify({
      message: `${context} error: ${message}`,
    }),
  };
};

