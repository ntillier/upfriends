import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCo4mQVJDtuOCjj4W0meVM-lKNAcxiLYQs",
  authDomain: "upfriends.firebaseapp.com",
  databaseURL: "https://upfriends-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "upfriends",
  storageBucket: "upfriends.appspot.com",
  messagingSenderId: "73285978833",
  appId: "1:73285978833:web:d35a3bcf63f971b58a93f0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);
const database = getDatabase(app);

export { auth, db, storage, database };