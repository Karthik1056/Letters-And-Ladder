import { db } from "@/firebaseConfig";
import { doc, setDoc, getDoc, updateDoc, deleteDoc, DocumentData } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

export interface UserData {
    uid: string; // Added uid as mandatory for saving/fetching
    email: string;
    name?: string;
    createdAt?: any;
    [key: string]: any; 
}

const USER_COLLECTION = "user_profiles";

// Removed the getUserIdFromStorage helper function

export const addUserInfo = async (data: UserData): Promise<void> => {
    let userId: string | null = null;
    try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
            const userObject = JSON.parse(storedUser);
            // Now expecting uid from the stored object, but still fallback for safety
            userId = userObject.uid || userObject.id; 
        }
    } catch (error) {
        console.error("Error retrieving userId from AsyncStorage:", error);
    }

    if (!userId) {
        throw new Error("User ID not found in storage. Cannot save user data.");
    }
    
    try {
        const userDocRef = doc(db, USER_COLLECTION, userId);
        
        // Use data as is, ensuring it includes uid, email, etc.
        await setDoc(userDocRef, data);
        console.log("User data successfully added/set for ID:", userId);
    } catch (error) {
        console.error("Error adding user data:", error);
        throw new Error("Failed to save user data.");
    }
}

export const getUserInfo = async (): Promise<UserData | null> => {
    let userId: string | null = null;
    try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
            const userObject = JSON.parse(storedUser);
            userId = userObject.uid || userObject.id; 
        }
    } catch (error) {
        console.error("Error retrieving userId from AsyncStorage:", error);
    }
    
    if (!userId) {
        throw new Error("User ID not found in storage. Cannot fetch user data.");
    }

    try {
        const userDocRef = doc(db, USER_COLLECTION, userId);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
            // Include Firestore document ID (which is userId) in the returned object
            return { uid: docSnap.id, ...docSnap.data() } as UserData;
        } else {
            console.log("No such user document found for ID:", userId);
            return null;
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
        throw new Error("Failed to fetch user data.");
    }
}

export const updateUserInfo = async (data: Partial<UserData>): Promise<void> => {
    let userId: string | null = null;
    try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
            const userObject = JSON.parse(storedUser);
            userId = userObject.uid || userObject.id; 
        }
    } catch (error) {
        console.error("Error retrieving userId from AsyncStorage:", error);
    }

    if (!userId) {
        throw new Error("User ID not found in storage. Cannot update user data.");
    }

    try {
        const userDocRef = doc(db, USER_COLLECTION, userId);

        await updateDoc(userDocRef, data as DocumentData);
        console.log("User data successfully updated for ID:", userId);
    } catch (error) {
        console.error("Error updating user data:", error);
        throw new Error("Failed to update user data.");
    }
}

export const deleteUserInfo = async (): Promise<void> => {
    let userId: string | null = null;
    try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
            const userObject = JSON.parse(storedUser);
            userId = userObject.uid || userObject.id; 
        }
    } catch (error) {
        console.error("Error retrieving userId from AsyncStorage:", error);
    }
    
    if (!userId) {
        throw new Error("User ID not found in storage. Cannot delete user document.");
    }
    
    try {
        const userDocRef = doc(db, USER_COLLECTION, userId);
        await deleteDoc(userDocRef);
        console.log("User document successfully deleted for ID:", userId);
    } catch (error) {
        console.error("Error deleting user document:", error);
        throw new Error("Failed to delete user document.");
    }
}
