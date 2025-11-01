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
export interface fetchChaperBySubject{
  boardName: string;
  className: string;
  subject: string;  
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

export async function fetchChaptersByFilters(
  boardName: string,
  className: string,
  subject: string
): Promise<fetchChaperBySubject[]> {

  if (!boardName || !className || !subject) {
    console.log("Missing boardName, className, or subject.");
    return [];
  }

  try {
    const q = query(
      collection(db, "chapters"),
      where("boardName", "==", boardName),
      where("className", "==", className),
      where("subject", "==", subject)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log("No matching chapters found.");
      return [];
    }

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Chapter));
  } catch (error) {
    console.error("Error fetching chapters:", error);
    return [];
  }
}
