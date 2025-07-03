// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  enableNetwork,
  disableNetwork
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
// You can import getAnalytics if you want analytics, but it's optional for auth.

const firebaseConfig = {
  apiKey: "AIzaSyCYhUQa74n4gMjWgDCFghE6MM6aH0rh2Vs",
  authDomain: "facebookmarketplace-69e6a.firebaseapp.com",
  projectId: "facebookmarketplace-69e6a",
  storageBucket: "facebookmarketplace-69e6a.appspot.com", // <-- fix typo: should be .app**spot**.com!
  messagingSenderId: "475622262419",
  appId: "1:475622262419:web:6bfb57de590c9902ff2f66",
  measurementId: "G-8KJPEVWLH1"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const goOnline = () => enableNetwork(db);
export const goOffline = () => disableNetwork(db);

// export const analytics = getAnalytics(app); // optional

export default app;
