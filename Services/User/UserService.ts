import { db } from "@/firebaseConfig.js";
import { doc, setDoc, getDoc, updateDoc, deleteDoc, DocumentData } from 'firebase/firestore';
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