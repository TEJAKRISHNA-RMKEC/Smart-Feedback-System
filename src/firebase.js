// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyC-AAnSObk0TqI-UMZkiXT3aLrqOPzIasw",
    authDomain: "smart-event-3837f.firebaseapp.com",
    projectId: "smart-event-3837f",
    storageBucket: "smart-event-3837f.firebasestorage.app",
    messagingSenderId: "733466023101",
    appId: "1:733466023101:web:1c7887d3ad3f9085d893d4",
    measurementId: "G-82747V4PH3"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
