import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "../firebaseConfig";
import { logout } from "../Services/Auth/AuthService";
import { TokenService } from "../Services/Auth/TokenService";

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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Firebase Auth state changed. User:", firebaseUser?.uid || 'None');
      if (firebaseUser) {
        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          const firestoreData = userSnap.exists() ? userSnap.data() : {};

          const userData: UserData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: firestoreData.name,
            createdAt: firestoreData.createdAt,
            state: firestoreData.state,
            className: firestoreData.className,
            boardName: firestoreData.boardName,
            selectedSubjects: firestoreData.selectedSubjects,
          };

          setUser(userData);
          await AsyncStorage.setItem("user", JSON.stringify(userData));
          
          // Save JWT token with 2-day expiration
          await TokenService.saveToken();
          console.log("Saved user and token to storage:", userData);

        } catch (error) {
          console.error("Error fetching Firestore data or saving to storage:", error);
          setUser(null);
          await AsyncStorage.removeItem("user");
          await TokenService.clearToken();
        }
      } else {
        setUser(null);
        await AsyncStorage.removeItem("user");
        await TokenService.clearToken();
        console.log("User signed out. Cleared all storage.");
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
      await TokenService.clearToken();
      console.log("User logged out successfully. Cleared all storage.");
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