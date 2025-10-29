// import { collection, getDocs, query, where, DocumentData } from 'firebase/firestore';
// import { db } from '../../firebaseConfig.js';

// export interface Class {
//   id: string;
//   name: string;
//   boardId: string | number;
// }

// export interface DataMap<T> {
//   [id: string]: T;
// }

// const arrayToMap = <T extends { id: string }>(docs: DocumentData[]): DataMap<T> => {
//   return docs.reduce((acc, doc) => {
//     acc[doc.id] = { id: doc.id, ...doc.data() } as T;
//     return acc;
//   }, {} as DataMap<T>);
// };
// export async function fetchClasses(selectedBoardId: string): Promise<DataMap<Class>> {
//   try {
//     const boardIdValue = Number(selectedBoardId);
    
//     const q = query(
//       collection(db, 'classes'), 
//       where('boardId', '==', boardIdValue)
//     );
//     const snapshot = await getDocs(q);
//     return arrayToMap<Class>(snapshot.docs);
//   } catch (error) {
//     console.error(`Error fetching classes for board ${selectedBoardId}:`, error);
//     return {};
//   }
// }

// src/Services/Class/Service.ts (or similar)

// import { collection, getDocs, query, where, DocumentData } from 'firebase/firestore';
// import { db } from '../../firebaseConfig.js'; // Adjust path if needed

// // Interface for the data structure returned by the function
// export interface Details {
//   classNames: string[];
//   subjectNames: string[];
// }

// // Fetches the class names and subject names for a specific board
// export async function fetchClasses(selectedBoardId: string): Promise<Details | null> {
//   try {
//     const boardIdValue = Number(selectedBoardId); // Convert string ID to number for query
//     console.log(`Fetching details for boardId: ${boardIdValue}`);

//     // Query for the single document matching the boardId
//     const q = query(
//       collection(db, 'classes'), // Assuming collection name is still 'classes'
//       where('boardId', '==', boardIdValue)
//     );
//     const snapshot = await getDocs(q);

//     if (snapshot.empty) {
//       console.log(`No details document found for boardId ${boardIdValue}`);
//       return null; // Indicate no data found
//     }

//     // Get data from the first (and only) document
//     const boardDoc = snapshot.docs[0];
//     const data = boardDoc.data();

//     // Extract arrays, providing empty arrays as fallback
//     const classNames = (Array.isArray(data.className) ? data.className : []) as string[];
//     const subjectNames = (Array.isArray(data.subjects) ? data.subjects : []) as string[];

//     // Filter out any potentially empty strings and trim whitespace
//     const cleanClassNames = classNames.map(name => name.trim()).filter(Boolean);
//     const cleanSubjectNames = subjectNames.map(name => name.trim()).filter(Boolean);


//     console.log(`Fetched details for board ${boardIdValue}:`, { classNames: cleanClassNames, subjectNames: cleanSubjectNames });
//     return {
//       classNames: cleanClassNames,
//       subjectNames: cleanSubjectNames,
//     };

//   } catch (error) {
//     console.error(`Error fetching details for board ${selectedBoardId}:`, error);
//     return null; // Return null on error
//   }
// }

import { collection, getDocs, query, where, DocumentData } from 'firebase/firestore';
import { db } from '../../firebaseConfig.js'; // Adjust path if needed

// Interface for the data structure returned by the function
export interface BoardDetails {
  classNames: string[];
  subjectNames: string[];
}

// Fetches the class names and subject names for a specific board
export async function fetchBoardDetails(selectedBoardId: string): Promise<BoardDetails | null> {
  try {
    const boardIdValue = Number(selectedBoardId); // Convert string ID to number for query
    console.log(`Fetching details for boardId: ${boardIdValue}`);

    // Query for the single document matching the boardId
    const q = query(
      collection(db, 'classes'), // Assuming collection name is 'classes'
      where('boardId', '==', boardIdValue)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log(`No details document found for boardId ${boardIdValue}`);
      return null; // Indicate no data found
    }

    // Get data from the first (and only) document
    const boardDoc = snapshot.docs[0];
    const data = boardDoc.data();

    // Extract arrays, providing empty arrays as fallback
    // Make sure 'className' and 'subjects' are the exact field names in Firestore
    const classNames = (Array.isArray(data.className) ? data.className : []) as string[];
    const subjectNames = (Array.isArray(data.subjects) ? data.subjects : []) as string[];

    // Filter out any potentially empty strings and trim whitespace
    const cleanClassNames = classNames.map(name => name.trim()).filter(Boolean);
    const cleanSubjectNames = subjectNames.map(name => name.trim()).filter(Boolean);


    console.log(`Fetched details for board ${boardIdValue}:`, { classNames: cleanClassNames, subjectNames: cleanSubjectNames });
    return {
      classNames: cleanClassNames,
      subjectNames: cleanSubjectNames,
    };

  } catch (error) {
    console.error(`Error fetching details for board ${selectedBoardId}:`, error);
    return null; // Return null on error
  }
}

// --- Keep other service functions if they exist (like fetchBoards) ---
// Example:
export interface Board {
    id: string;
    name: string;
    // other board properties...
}

export interface DataMap<T> {
    [id: string]: T;
}

const arrayToMap = <T extends { id: string }>(docs: DocumentData[]): DataMap<T> => {
    return docs.reduce((acc, doc) => {
        acc[doc.id] = { id: doc.id, ...doc.data() } as T;
        return acc;
    }, {} as DataMap<T>);
};

export async function fetchBoards(): Promise<DataMap<Board>> {
    try {
        const q = query(collection(db, 'boards')); // Assuming collection name is 'boards'
        const snapshot = await getDocs(q);
        return arrayToMap<Board>(snapshot.docs);
    } catch (error) {
        console.error("Error fetching boards:", error);
        return {};
    }
}
// --- Add other necessary exports or functions ---