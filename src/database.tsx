import * as firebase from "firebase/app";
import "firebase/firestore";

import "./firebaseConfig";

export const database = firebase.firestore();
