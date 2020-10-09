export default interface RecordData {
  id: string;
}

export type Unsaved<T> = Omit<T, "id" | "createdAt">;
