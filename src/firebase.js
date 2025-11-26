// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD9GMwmb1Ec8YIwie8nBJgPJ_cFhOhOxIY",
  authDomain: "registration-953a6.firebaseapp.com",
  databaseURL: "https://registration-953a6-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "registration-953a6",
  storageBucket: "registration-953a6.firebasestorage.app",
  messagingSenderId: "413721871847",
  appId: "1:413721871847:web:1989c5427d5b3f805fe942",
  measurementId: "G-Z79SL11JTX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, auth, db, storage };
