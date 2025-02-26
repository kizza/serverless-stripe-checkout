import { put, qyeryExpression } from "../aws/dynamodb";

interface PersistedPurchase {
  internalId: string
  purchaseId: string
  name: string
  email: string
  createdAt: number
  updatedAt: number
}

export const lookupPurchase = (internalId: string, purchaseId: string) =>
  qyeryExpression(
    process.env.PURCHASE_TABLE_NAME!,
    "internalId = :internalId AND purchaseId = :purchaseId",
    {":internalId": internalId, ":purchaseId": purchaseId}
  ).then(response => {
    if (response.Items && response.Items.length > 0) {
      console.log("Returning existing persisted purchase", response.Items);
      return response.Items[0] as PersistedPurchase;
    } else {
      console.log("No existing purchase. Continuing fullfillment");
    }
  });

export const persistPurchase = (attributes: PersistedPurchase) =>
  put(process.env.PURCHASE_TABLE_NAME!, attributes)
