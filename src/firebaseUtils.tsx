import { database } from "./database";

export async function insertRecord<T>(collectionName: string, value: T) {
  return (await database.collection(collectionName).add(value)).id;
}
