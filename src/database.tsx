import * as firebase from "firebase/app";
import "firebase/firestore";

import "./firebaseConfig";

export const database = firebase.firestore();

export enum Collections {
  Issues = "issues",
  Homes = "homes",
  Monies = "incomes",
}
