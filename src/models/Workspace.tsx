import * as firebase from "firebase/app";
import RecordData from "../types/RecordData";
import UserScoped from "../types/UserScoped";
import { BaseModelInterface } from "./BaseModel";

interface WorkspaceData extends RecordData, UserScoped {
  name: string;
  createdAt: string;
}

export default class Workspace implements BaseModelInterface {
  protected data: WorkspaceData;
  id: string;

  constructor(id: string, data: WorkspaceData) {
    this.data = data;
    this.id = id;
  }

  get name(): string {
    return this.data.name;
  }
}

export const firestoreWorkspaceConverter: firebase.firestore.FirestoreDataConverter<Workspace> = {
  toFirestore() {
    return {};
  },
  fromFirestore(
    snapshot: firebase.firestore.QueryDocumentSnapshot,
    options: firebase.firestore.SnapshotOptions
  ): Workspace {
    const data = snapshot.data(options)!;

    return new Workspace(snapshot.id, data as WorkspaceData);
  },
};
