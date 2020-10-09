export default interface UserScoped {
  uid: string;
}

export type WithoutUser<T> = Omit<T, "uid">;
export type WithoutHome<T> = Omit<T, "homeId">;
