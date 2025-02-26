export class ContextualError extends Error {
  public originalError: any;

  constructor(message: string, originalError?: any) {
    super(message);
    this.name = this.constructor.name;
    this.originalError = originalError || null;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    if (originalError?.stack) {
      this.stack += '\nCaused by: ' + originalError.stack;
    }
  }
}

export const ensureArray = <T>(value: T | T[]): T[] => Array.isArray(value) ? value : [value];

export const trace = (...args: any[]) => {
  if (process.env.NODE_ENV === "test") return
  const prefix = process.env.AWS_LAMBDA_FUNCTION_NAME || ""
  console.log(prefix, ...args)
}

export const mapKeys = <T extends Record<string, any>>(object: T, fn: (key: string) => string) =>
  Object.keys(object).reduce((acc, k) => {
    acc[fn(k)] = object[k];
    return acc;
  }, {} as any);

export const mapEntries = <T extends Record<string, any>, K extends string, V>(
  obj: T,
  fn: (key: string & keyof T, value: T[keyof T]) => [K, V]
): T =>
  Object.entries(obj).reduce((acc, [key, value]) => {
    const [newKey, newValue] = fn(key as string & keyof T, value);
    return {...acc, [newKey]: newValue}
  }, {} as T);
