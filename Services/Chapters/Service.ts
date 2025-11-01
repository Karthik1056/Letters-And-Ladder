import { collection, getDocs, query, where, DocumentData } from 'firebase/firestore';
import { db } from '../../firebaseConfig.js'; 

interface UserData {
  uid: string;
  email: string;
  name?: string;
  createdAt?: any;
  state?: string;
  className?: string;
  boardName?: string;
  selectedSubjects?: { [key: string]: boolean };
}

export interface Chapter {
  id: string; 
  boardName: string;
  className: string;
  name: string; 
  number: number;
  subject: string; 
  textUrl: string;
}

export async function fetchAllChapters(): Promise<Chapter[]> {
  try {
    const q = query(collection(db, "chapters"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log("No chapters found in the collection.");
      return [];
    }

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Chapter));

  } catch (error) {
    console.error("Error fetching all chapters:", error);
    return [];
  }
}

export async function fetchUserChapters(user: UserData): Promise<Chapter[]> {
  const { boardName, className, selectedSubjects } = user;

  if (!boardName || !className || !selectedSubjects) {
    console.log("User data (board, class, or subjects) is incomplete. Cannot fetch chapters.");
    return [];
  }

  const subjectsToFetch = Object.keys(selectedSubjects).filter(
    (subjectName) => selectedSubjects[subjectName] === true
  );

  if (subjectsToFetch.length === 0) {
    console.log("No subjects selected by the user.");
    return [];
  }

  if (subjectsToFetch.length > 30) {
     console.warn("User has more than 30 subjects selected. Firestore query will fail.");
  }

  try {
    const q = query(
      collection(db, "chapters"),
      where("boardName", "==", boardName),
      where("className", "==", className),
      where("subject", "in", subjectsToFetch)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log("No matching chapters found for user's selection.");
      return [];
    }

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Chapter));

  } catch (error) {
    console.error("Error fetching user chapters:", error);
    return [];
  }
}