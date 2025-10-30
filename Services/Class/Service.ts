// import { collection, getDocs } from "firebase/firestore";
// import { db } from "../../firebaseConfig.js";

// export interface ClassItem {
//   id: string;
//   name: string;
//   boardName: string;
//   subjects: string[];
// }

// export async function fetchAllClasses(): Promise<ClassItem[]> {
//   try {
//     const snapshot = await getDocs(collection(db, "classes"));

//     if (snapshot.empty) return [];

//     return snapshot.docs.map((doc) => {
//       const data = doc.data();
//       return {
//         id: doc.id,
//         name: data.name || "",
//         boardName: data.boardName || "",
//         subjects: Array.isArray(data.subjects) ? data.subjects : [],
//       };
//     });
//   } catch (error) {
//     console.error("Error fetching classes:", error);
//     return [];
//   }
// }

import { collection, getDocs, query, where, DocumentData } from "firebase/firestore";
import { db } from "../../firebaseConfig.js"; // Adjust path

// This interface matches your Firestore data and includes the unique doc ID
export interface ClassItem {
  id: string; // The unique document ID from Firestore
  name: string; // The class name (e.g., "4th")
  boardName: string;
  subjects: string[];
}

// Fetches only the classes for the board you selected
export async function fetchClassesByBoardName(boardName: string): Promise<ClassItem[]> {
  try {
    console.log(`Fetching classes for board: ${boardName}`);

    // Query 'classes' collection where 'boardName' matches the selected name
    const q = query(collection(db, "classes"), where("boardName", "==", boardName));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log(`No classes found for board: ${boardName}`);
      return [];
    }

    // Map the documents to the ClassItem structure
    const classes: ClassItem[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id, // Use the unique document ID
        name: data.name || "", // Use the 'name' field (matches image)
        boardName: data.boardName || "",
        subjects: Array.isArray(data.subjects) ? data.subjects : [],
      };
    });

    return classes;
  } catch (error) {
    console.error(`Error fetching classes for board ${boardName}:`, error);
    return [];
  }
}