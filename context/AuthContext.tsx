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
  state? :string;
  class ?:string;
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

  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error loading user from storage:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStoredUser();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        const userData: UserData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: userSnap.exists() ? userSnap.data().name : undefined,
          createdAt: userSnap.exists() ? userSnap.data().createdAt : undefined,
          state: userSnap.exists()? userSnap.data().state:undefined,
          class: userSnap.exists()? userSnap.data().class : undefined,
        };

        // Save to state and AsyncStorage
        setUser(userData);
        await AsyncStorage.setItem("user", JSON.stringify(userData));
      } else {
        setUser(null);
        await AsyncStorage.removeItem("user");
      }
    });

    return unsubscribe;
  }, []);

  const logoutUser = async () => {
    await logout();
    setUser(null);
    await AsyncStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, loading, logoutUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside an AuthProvider");
  return context;
};
