export default interface FirebaseProxy {
  delete(): Promise<void>;
  update(values: firebase.firestore.UpdateData): Promise<void>;
  toJSON(): { [key: string]: string | number | undefined };
}
