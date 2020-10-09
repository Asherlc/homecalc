import { Collections, database } from "./database";
import { Unsaved } from "./types/RecordData";

export async function insertRecord<T>(
  collectionName: Collections,
  value: Unsaved<T>
): Promise<string> {
  return (
    await database.collection(collectionName).add({
      createdAt: Date.now(),
      ...value,
    })
  ).id;
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
