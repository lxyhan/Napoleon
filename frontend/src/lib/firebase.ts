import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyD1d9d0kxhm1SnNUK67DPD0-VsMszyeu6g",
    authDomain: "napoleon-c94b4.firebaseapp.com",
    projectId: "napoleon-c94b4",
    storageBucket: "napoleon-c94b4.firebasestorage.app",
    messagingSenderId: "491794082949",
    appId: "1:491794082949:web:11e4cde45b8cd4bf30cdec",
    measurementId: "G-NJ37B6NSEK"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
