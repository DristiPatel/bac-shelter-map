// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDQTEEyc1T6imfX_XJ8qIV9px_6jApxxmQ",
  authDomain: "bayareacats-38b74.firebaseapp.com",
  projectId: "bayareacats-38b74",
  storageBucket: "bayareacats-38b74.firebasestorage.app",
  messagingSenderId: "709418607392",
  appId: "1:709418607392:web:85777a836540aca5312d45",
  measurementId: "G-XDYZEZ7HGG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);