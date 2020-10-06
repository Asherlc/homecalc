import { Collections, database } from "./database";

export async function insertRecord<T>(
  collectionName: Collections,
  value: T
): Promise<string> {
  console.log(collectionName, value);
  return (await database.collection(collectionName).add(value)).id;
}

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

export function removeRecord(
  collectionName: Collections,
  id: string
): Promise<void> {
  return database.collection(collectionName).doc(id).delete();
}
