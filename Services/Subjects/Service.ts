import { collection, getDocs, query, where, DocumentData } from 'firebase/firestore';
import { db } from '../../firebaseConfig.js';

export interface Subject {
  id: string;
  name: string;
  classId: string | number;
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

export async function fetchSubjects(selectedClassId: string): Promise<DataMap<Subject>> {
  try {
    const classIdValue = Number(selectedClassId);
    
    const q = query(
      collection(db, 'subjects'), 
      where('classId', '==', classIdValue)
    );
    const snapshot = await getDocs(q);
    return arrayToMap<Subject>(snapshot.docs);
  } catch (error) {
    console.error(`Error fetching subjects for class ${selectedClassId}:`, error);
    return {};
  }
}