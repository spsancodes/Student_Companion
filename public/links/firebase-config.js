import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBnrDP1Xv4eNSqZ2cOXEDr1IwlliULJqbM",
  authDomain: "link-saver-22163.firebaseapp.com",
  projectId: "link-saver-22163",
  storageBucket: "link-saver-22163.appspot.com",
  messagingSenderId: "725870393554",
  appId: "1:725870393554:web:4566ad47fa9b4b3ad7550b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export { db };