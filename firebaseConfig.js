
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBnsDr_cd5W6mivTsm-aSgrlHvjFUX79mk",
  authDomain: "letters-and-ladder-ccfdb.firebaseapp.com",
  projectId: "letters-and-ladder-ccfdb",
  storageBucket: "letters-and-ladder-ccfdb.firebasestorage.app",
  messagingSenderId: "529913488120",
  appId: "1:529913488120:web:2ba48e5e9257188dd0d10d",
  measurementId: "G-W1TCJD8JYE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const analytics = getAnalytics(app);

export default app;