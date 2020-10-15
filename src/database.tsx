import * as firebase from "firebase/app";
import "firebase/firestore";

import "./firebaseConfig";

// firebase.firestore.setLogLevel("debug");

export const database = firebase.firestore();

export enum Collections {
  Workspaces = "workspaces",
  Issues = "issues",
  Homes = "homes",
  Monies = "incomes",
}
