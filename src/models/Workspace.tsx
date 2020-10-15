import * as firebase from "firebase/app";

interface WorkspaceData {
  name: string;
  createdAt: Date;
  owners: string[];
}

export default class Workspace {
  data: WorkspaceData;

  constructor(data: WorkspaceData) {
    this.data = data;
  }

  get name(): string {
    return this.data.name;
  }

  get owners(): string[] {
    return this.data.owners;
  }
}

export const firestoreWorkspaceConverter: firebase.firestore.FirestoreDataConverter<Workspace> = {
  toFirestore(model: Workspace) {
    return model.data;
  },
  fromFirestore(
    snapshot: firebase.firestore.QueryDocumentSnapshot,
    options: firebase.firestore.SnapshotOptions
  ): Workspace {
    const data = snapshot.data(options)!;

    return new Workspace(data as WorkspaceData);
  },
};
