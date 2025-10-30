import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "../firebaseConfig";
import { logout } from "../Services/Auth/AuthService";

interface UserData {
  uid: string;
  email: string;
  name?: string;
  createdAt?: any;
  state?: string;
  // Rename 'class' to avoid conflict with keyword
  className?: string; // Changed from 'class'
  boardName?: string;
  selectedSubjects?: { [key: string]: boolean };
}


interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Effect to load user from AsyncStorage on initial mount
  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log("Loaded user from AsyncStorage:", parsedUser); // Log loaded user
          setUser(parsedUser);
        } else {
          console.log("No user found in AsyncStorage on initial load.");
        }
      } catch (error) {
        console.error("Error loading user from storage:", error);
      } finally {
        // Set loading to false only after attempting to load
        setLoading(false);
      }
    };

    loadStoredUser();
  }, []); // Empty dependency array means run once on mount

  // Effect to listen to Firebase Auth state changes
  useEffect(() => {
    // Set loading to true when starting the listener
    // setLoading(true); // Re-enable loading check during auth state change

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Firebase Auth state changed. User:", firebaseUser?.uid || 'None');
      if (firebaseUser) {
        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          const firestoreData = userSnap.exists() ? userSnap.data() : {};

          // Construct userData carefully, checking for undefined explicitly
          const userData: UserData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || "", // Ensure email is not null
            name: firestoreData.name, // Will be undefined if not present
            createdAt: firestoreData.createdAt, // Will be undefined if not present
            state: firestoreData.state, // Will be undefined if not present
            className: firestoreData.className, // Changed from 'class'
            boardName: firestoreData.boardName, // Add boardName
            selectedSubjects: firestoreData.selectedSubjects, // Add selectedSubjects
          };

          // Update state
          setUser(userData);

          // Save to AsyncStorage
          const userDataString = JSON.stringify(userData);
          await AsyncStorage.setItem("user", userDataString);
          console.log("Saved user to AsyncStorage:", userData); // Log saved user

          // Optionally read back immediately to verify (for debugging)
          const readBackUser = await AsyncStorage.getItem("user");
          console.log("Read back user immediately after save:", readBackUser ? JSON.parse(readBackUser) : null);

        } catch (error) {
          console.error("Error fetching Firestore data or saving to AsyncStorage:", error);
          // Decide how to handle this - maybe log out the user?
          setUser(null);
          await AsyncStorage.removeItem("user");
          console.log("Removed user from AsyncStorage due to error during fetch/save.");
        }
      } else {
        setUser(null);
        await AsyncStorage.removeItem("user");
        console.log("User signed out. Removed user from AsyncStorage.");

        // Optionally read back immediately to verify removal (for debugging)
        const readBackUser = await AsyncStorage.getItem("user");
        console.log("Read back user immediately after removal (should be null):", readBackUser);
      }

    });

    return () => {
      console.log("Unsubscribing from Firebase Auth state changes.");
      unsubscribe();
    };
  }, []); 

  const logoutUser = async () => {
    console.log("logoutUser called.");
    try {
      await logout(); 
      setUser(null);
      await AsyncStorage.removeItem("user"); 
      console.log("User logged out successfully. Removed user from AsyncStorage.");

      
      const readBackUser = await AsyncStorage.getItem("user");
      console.log("Read back user immediately after logout removal (should be null):", readBackUser);

    } catch (error) {
      console.error("Error during logout:", error);
 
    }
  };


  return (
    <AuthContext.Provider value={{ user, loading, logoutUser }}>
      {!loading ? children : null }
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) { // Check for undefined explicitly
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
};