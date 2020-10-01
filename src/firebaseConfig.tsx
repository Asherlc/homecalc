import * as firebase from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDONcnazlcu-lAWcrC8XPdu0B4grH7benw",
  authDomain: "homecalc-ef45c.firebaseapp.com",
  databaseURL: "https://homecalc-ef45c.firebaseio.com",
  projectId: "homecalc-ef45c",
  storageBucket: "homecalc-ef45c.appspot.com",
  messagingSenderId: "131552060892",
  appId: "1:131552060892:web:b747681044bbb71578db19",
};
if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}
