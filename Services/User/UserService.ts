import { db } from "@/firebaseConfig.js";
import { doc, setDoc, getDoc, updateDoc, deleteDoc, DocumentData,getCountFromServer,collection,query,where } from 'firebase/firestore';
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

// export const setUserProgress = async (progressData: UserProgress): Promise<UserProgress> => {
//     try {
//         const storedUser = await AsyncStorage.getItem("user");
//         const userData = storedUser ? JSON.parse(storedUser) : null;

//         const { uid, className, boardName,selectedSubjects } = userData as UserDataAsync;

//         if (!uid) {
//             throw new Error("User ID not found in storage. Cannot set user progress.");
//         }



//         return progressData;
//     } catch (error) {

//     }
// }


export const initializeUserProgress = async ():Promise<UserProgress | void> => {
    try {
        const storedUser = await AsyncStorage.getItem("user");

        if (!storedUser) {
            console.error("No user found in AsyncStorage");
            return;
        }

        const userData: UserDataAsync = JSON.parse(storedUser);

        // 2. Validate essential fields exist
        if (!userData.uid || !userData.boardName || !userData.className || !userData.selectedSubjects) {
            console.error("Incomplete user data in storage. Cannot initialize progress.");
            return;
        }

        const { uid, boardName, className, selectedSubjects } = userData;

        const progressData: UserProgress = {
            userId: uid,
            boardName: boardName,
            className: className,
            subjects: {}
        };

        const subjectPromises = Object.keys(selectedSubjects).map(async (subject) => {

            if (selectedSubjects[subject] === true) {
                try {
                    const chaptersRef = collection(db, "Chapters");

                    const q = query(
                        chaptersRef,
                        where("boardName", "==", boardName),
                        where("className", "==", className),
                        where("subject", "==", subject)
                    );

                    const snapshot = await getCountFromServer(q);
                    const totalCount = snapshot.data().count;

                    progressData.subjects[subject] = {
                        totalLessons: totalCount,
                        completedLessons: 0,
                        percentage: 0
                    };

                } catch (error) {
                    console.error(`Error counting chapters for ${subject}:`, error);
                    progressData.subjects[subject] = { totalLessons: 0, completedLessons: 0, percentage: 0 };
                }
            }
        });

        await Promise.all(subjectPromises);

        const progressDocRef = doc(db, "UserProgress", uid);
        await setDoc(progressDocRef, progressData);

        console.log("User Progress Successfully Initialized!");
        return progressData;

    } catch (error) {
        console.error("Failed to initialize user progress:", error);
        throw error;
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