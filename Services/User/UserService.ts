import { db } from "@/firebaseConfig.js";
import { doc, setDoc, getDoc, updateDoc, deleteDoc, DocumentData,getCountFromServer,collection,query,where ,runTransaction} from 'firebase/firestore';
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface UserData {
    uid: string | number;
    email: string;
    name?: string;
    createdAt?: any;
    board?: string;
    class?: string;
    [key: string]: any;
}
export interface UserProgress {
    userId: string;
    className: string;
    boardName: string;
    subjects: {
        [selectedSubjects: string]: {
            totalLessons: number;
            completedLessons: number;
            percentage: number;
        };
    };
    
}
export interface NewCourseData {
    boardName: string;
    className: string;
    userId: string | number;
    [key: string]: any;

}
interface UserDataAsync {
    uid: string;
    email: string;
    name?: string;
    createdAt?: any;
    state?: string;
    className?: string;
    boardName?: string;
    selectedSubjects?: { [key: string]: boolean };
}

export interface SubjectProgress {
    totalLessons: number;
    completedLessons: number;
    percentage: number;
}

const USER_COLLECTION = "users";

export const addUserInfo = async (data: Partial<UserData>): Promise<UserData> => {
    const storedUser = await AsyncStorage.getItem("user");
    let userData: UserData | null = null;

    if (storedUser) {
        const userObject = JSON.parse(storedUser);
        userData = { ...userObject, ...data };
    }

    if (!userData || !userData.uid) {
        throw new Error("User authentication context missing. Cannot create profile.");
    }

    try {
        const userDocRef = doc(db, USER_COLLECTION, String(userData.uid));
        await setDoc(userDocRef, { ...userData, createdAt: new Date() } as DocumentData, { merge: true });

        const updatedUserData: UserData = { ...userData, createdAt: new Date() };

        await AsyncStorage.setItem("user", JSON.stringify(updatedUserData));

        return updatedUserData;
    } catch (error) {
        throw new Error("Failed to add user data.");
    }
}

export const getUserInfo = async (): Promise<UserData | null> => {
    const storedUser = await AsyncStorage.getItem("user");

    if (!storedUser) {
        return null;
    }

    const { uid } = JSON.parse(storedUser);

    if (!uid) {
        return null;
    }

    try {
        const userDocRef = doc(db, USER_COLLECTION, String(uid));
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
            const firestoreData = docSnap.data() as UserData;
            return { ...firestoreData };
        }
        return null;
    } catch (error) {
        throw new Error("Failed to fetch user data.");
    }
}

export const updateUserInfo = async (data: Partial<UserData>): Promise<UserData> => {
    const storedUser = await AsyncStorage.getItem("user");

    if (!storedUser) {
        throw new Error("User ID not found in storage. Cannot update user data.");
    }

    const userData = JSON.parse(storedUser) as UserData;
    const { uid } = userData;

    if (!uid) {
        throw new Error("User ID not found in storage. Cannot update user data.");
    }

    try {
        const userDocRef = doc(db, USER_COLLECTION, String(uid));

        // 1. Update Firestore
        await updateDoc(userDocRef, data as DocumentData);

        // 2. Merge data and update AsyncStorage
        const updatedUserData = { ...userData, ...data };
        await AsyncStorage.setItem("user", JSON.stringify(updatedUserData));



        return updatedUserData;
    } catch (error) {
        throw new Error("Failed to update user data.");
    }
}

export const deleteUserInfo = async (): Promise<void> => {
    const storedUser = await AsyncStorage.getItem("user");

    if (!storedUser) {
        return;
    }

    const { uid } = JSON.parse(storedUser);

    if (!uid) {
        return;
    }

    try {
        const userDocRef = doc(db, USER_COLLECTION, String(uid));
        await deleteDoc(userDocRef);
        await AsyncStorage.removeItem("user");
    } catch (error) {
        throw new Error("Failed to delete user data.");
    }
}


export const addNewCourse = async (data: NewCourseData): Promise<NewCourseData> => {
    try {
        await setDoc(doc(db, "newCourse"), {
            ...data
        });

        return data;
    } catch (error) {
        throw new Error("Failed to add course data.");
    }
}


export const changeUserName = async (newName: string): Promise<void> => {
    const storedUser = await AsyncStorage.getItem("user");

    const userData = storedUser ? JSON.parse(storedUser) as UserData : null;

    if (!userData || !userData.uid) {
        throw new Error("User ID not found in storage. Cannot update user name.");
    }
    const { uid } = userData;

    try {
        const userDocRef = doc(db, USER_COLLECTION, String(uid));

        await updateDoc(userDocRef, { name: newName } as DocumentData);
        const updatedUserData = { ...userData, name: newName };
        await AsyncStorage.setItem("user", JSON.stringify(updatedUserData));

    } catch (error) {
        throw new Error("Failed to update user name.");
    }
}

export const initializeUserProgress = async (): Promise<UserProgress | void> => {
    try {
        const storedUser = await AsyncStorage.getItem("user");
        if (!storedUser) return;

        const userData: UserDataAsync = JSON.parse(storedUser);
        const { uid, boardName, className, selectedSubjects } = userData;

        console.log("--------------------------------------------------");
        console.log("DEBUG START: Initialize Progress");
        console.log(`User Config: Board="${boardName}", Class="${className}"`);
        console.log("Selected Subjects RAW:", JSON.stringify(selectedSubjects));

        const progressData: UserProgress = {
            userId: uid,
            boardName: boardName || '',
            className: className || '',
            subjects: {}
        };

        const subjectPromises = Object.keys(selectedSubjects || {}).map(async (subject) => {
            // DEBUG: Log if we are skipping or running
            if (selectedSubjects?.[subject] !== true) {
                console.warn(`[SKIP] Subject "${subject}" is FALSE or undefined.`);
                return; 
            }

            try {
                const chaptersRef = collection(db, "Chapters");
                
                // Ensure exact matches (Case Sensitive!)
                const q = query(
                    chaptersRef,
                    where("boardName", "==", boardName), // Check for "State" vs "state"
                    where("className", "==", className), // Check for "4th" vs 4
                    where("subject", "==", subject)      // Check for "EVS" vs "EVS "
                );

                const snapshot = await getCountFromServer(q);
                const totalCount = snapshot.data().count;

                console.log(`[SUCCESS] Found ${totalCount} chapters for ${subject}`);

                progressData.subjects[subject] = {
                    totalLessons: totalCount,
                    completedLessons: 0,
                    percentage: 0
                };

            } catch (error: any) {
                // Check if it's an index error
                if (error.message.includes("index")) {
                    console.error(`[CRITICAL] MISSING INDEX for ${subject}. Click the link in console to fix!`);
                }
                console.error(`[ERROR] Failed to count ${subject}:`, error);
                
                // Do NOT default to 0 silently while debugging
                // progressData.subjects[subject] = { totalLessons: 0 ... }; 
            }
        });

        await Promise.all(subjectPromises);

        if (Object.keys(progressData.subjects).length > 0) {
             const progressDocRef = doc(db, "UserProgress", uid);
             await setDoc(progressDocRef, progressData);
             console.log("Progress saved to Firestore!");
        } else {
             console.warn("No subjects were selected/found. Nothing saved.");
        }

        return progressData;

    } catch (error) {
        console.error("Initialization Failed:", error);
    }
};

export const getUserProgress = async (): Promise<UserProgress | null> => {
  try {
    const storedUser = await AsyncStorage.getItem("user");
    
    if (!storedUser) {
        return null;
    }

    const userData: UserDataAsync = JSON.parse(storedUser);
    const { uid } = userData;

    if (!uid) {
        return null;
    }

    const docRef = doc(db, "UserProgress", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserProgress;
    } else {
      return null;
    }

  } catch (error) {
    console.error("Error fetching user progress:", error);
    return null;
  }
};

export const updateSubjectProgress = async (subjectName: string): Promise<boolean> => {
  try {
    // 2. Retrieve User Data from Local Storage
    const jsonValue = await AsyncStorage.getItem("user");
    
    if (!jsonValue) {
      console.error("No user data found in AsyncStorage");
      return false;
    }

    const userData: UserDataAsync = JSON.parse(jsonValue);
    const { uid, selectedSubjects } = userData;

    if (!uid) {
      console.error("User UID missing in local data");
      return false;
    }

    // 3. Optional: Verify subject is actually selected locally
    // This ensures we don't update progress for a subject the user disabled locally
    if (selectedSubjects && selectedSubjects[subjectName] !== true) {
      console.warn(`Subject '${subjectName}' is not marked as selected in local storage.`);
      // You can choose to return false here if you want to be strict
    }

    // 4. Reference the Firestore Document
    const userProgressRef = doc(db, "UserProgress", uid);

    // 5. Run Transaction
    await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(userProgressRef);

      if (!docSnap.exists()) {
        throw "User Progress document does not exist in Firestore!";
      }

      const firestoreData = docSnap.data();
      
      // Access the specific subject inside the 'subjects' map in Firestore
      // Note: This relies on Firestore structure matching { subjects: { English: { ... } } }
      const subjectData = firestoreData.subjects ? firestoreData.subjects[subjectName] : null;

      if (!subjectData) {
        throw `Subject '${subjectName}' not found in Firestore document.`;
      }

      // 6. Calculate New Values
      const currentCompleted = subjectData.completedLessons || 0;
      const total = subjectData.totalLessons || 1; // Prevent division by zero

      // Increment
      let newCompleted = currentCompleted + 1;

      // Safety: Don't exceed total
      if (newCompleted > total) {
        newCompleted = total;
      }

      // Calculate Percentage (Round to nearest integer)
      const newPercentage = Math.round((newCompleted / total) * 100);

      // 7. Update Firestore using Dot Notation
      // This updates ONLY the specific subject fields without touching others
      transaction.update(userProgressRef, {
        [`subjects.${subjectName}.completedLessons`]: newCompleted,
        [`subjects.${subjectName}.percentage`]: newPercentage
      });
    });

    console.log(`Successfully updated progress for ${subjectName}`);
    return true;

  } catch (error) {
    console.error("Transaction failed:", error);
    return false;
  }
};