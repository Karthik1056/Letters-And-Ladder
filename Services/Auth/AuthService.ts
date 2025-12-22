
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth, db } from "../../firebaseConfig.js";
import { doc, setDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface SignUpData {
  email: string;
  password: string;
  name: string;
}

export interface UserData {
    uid: string | number;
    email: string;
    name?: string;
    createdAt?: any;
    board?: string;
    class?: string;
    [key: string]: any;
}

export const signUp = async ({ email, password, name }: SignUpData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      name,
      email,
      createdAt: new Date(),
    });

    return user;
  } catch (error: any) {
    console.error("Error signing up:", error.message);
    throw new Error(error.message);
  }
};

export const login = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error("Login error:", error.message);
    throw new Error(error.message);
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error("Error signing out:", error.message);
    throw new Error(error.message);
  }
};

export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
  const user = auth.currentUser;

  if (!user || !user.email) {
    throw new Error("No authenticated user found.");
  }

  try {
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    await updatePassword(user, newPassword);
    
    console.log("Password updated successfully!");

  } catch (error: any) {
    console.error("Error changing password:", error);
    if (error.code === 'auth/wrong-password') {
        throw new Error("The current password you entered is incorrect.");
    }
    throw error;
  }
}

export const resetPassword = async (email: string): Promise<void> => {

  
  if (!email) {
    throw new Error("Please enter your email address.");
  }

  try {
    await sendPasswordResetEmail(auth, email);
    console.log("Password reset email sent!");
  } catch (error: any) {
    console.error("Error sending reset email:", error);
    
    if (error.code === 'auth/user-not-found') {
      throw new Error("No user found with this email.");
    } else if (error.code === 'auth/invalid-email') {
      throw new Error("That email address is invalid.");
    }
    
    throw new Error("Failed to send reset email. Please try again.");
  }
};