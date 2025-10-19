import { collection, getDocs, query, where, DocumentData } from 'firebase/firestore';
import { db } from '../../firebaseConfig.js';

export interface Board {
  id: string;
  name: string;
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
    const snapshot = await getDocs(collection(db, 'boards'));
    return arrayToMap<Board>(snapshot.docs);
  } catch (error) {
    console.error('Error fetching boards:', error);
    return {};
  }
}




