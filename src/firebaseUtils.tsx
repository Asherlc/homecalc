import { Collections, database } from "./database";

export function updateAttribute(
  collectionName: Collections,
  id: string,
  values: {
    [key: string]: any;
  }
): Promise<void> {
  return database
    .collection(collectionName)
    .doc(id)
    .set(values, { merge: true });
}
