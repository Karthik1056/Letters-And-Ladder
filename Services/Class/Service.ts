import { collection, getDocs, query, where, DocumentData } from 'firebase/firestore';
import { db } from '../../firebaseConfig.js';

export interface Class {
  id: string;
  name: string;
  boardId: string | number;
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
export async function fetchClasses(selectedBoardId: string): Promise<DataMap<Class>> {
  try {
    const boardIdValue = Number(selectedBoardId);
    
    const q = query(
      collection(db, 'classes'), 
      where('boardId', '==', boardIdValue)
    );
    const snapshot = await getDocs(q);
    return arrayToMap<Class>(snapshot.docs);
  } catch (error) {
    console.error(`Error fetching classes for board ${selectedBoardId}:`, error);
    return {};
  }
}