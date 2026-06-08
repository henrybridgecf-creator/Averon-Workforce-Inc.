'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { AppUser } from '@/types';

interface AuthContextType {
  user: (FirebaseUser & { appUser?: AppUser }) | null;
  signup: (email: string, password: string, fullName: string, phoneNumber?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  updateUserLocation: (latitude: number, longitude: number, address: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<(FirebaseUser & { appUser?: AppUser }) | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize persistence
  useEffect(() => {
    const initializePersistence = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (error) {
        console.error('Error setting persistence:', error);
      }
    };

    initializePersistence();
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const appUser = userDoc.data() as AppUser;
            setUser({ ...firebaseUser, appUser } as any);
          } else {
            setUser(firebaseUser as any);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(firebaseUser as any);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (
    email: string,
    password: string,
    fullName: string,
    phoneNumber?: string
  ) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;

      // Generate unique ID
      const averpayId = `AP-${Date.now()}`;

      // Create user document in Firestore
      const appUser: AppUser = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        fullName,
        phoneNumber: phoneNumber || '',
        averpayId,
        status: 'pending',
        balance: 0,
        totalEarnings: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        location: null,
        projectsAssigned: [],
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), appUser);

      setUser({ ...firebaseUser, appUser } as any);
    } catch (error: any) {
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;

      // Fetch user data from Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const appUser = userDoc.data() as AppUser;
        setUser({ ...firebaseUser, appUser } as any);
      } else {
        // Create user document if it doesn't exist
        const appUser: AppUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          fullName: firebaseUser.displayName || '',
          phoneNumber: '',
          averpayId: `AP-${Date.now()}`,
          status: 'pending',
          balance: 0,
          totalEarnings: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          location: null,
          projectsAssigned: [],
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), appUser);
        setUser({ ...firebaseUser, appUser } as any);
      }
    } catch (error: any) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error: any) {
      throw error;
    }
  };

  const updateUserLocation = async (
    latitude: number,
    longitude: number,
    address: string
  ) => {
    if (!user) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        location: {
          latitude,
          longitude,
          address,
        },
        updatedAt: serverTimestamp(),
      });

      // Update local state
      const updatedUser = {
        ...user,
        appUser: {
          ...user.appUser!,
          location: { latitude, longitude, address },
        },
      };
      setUser(updatedUser as any);
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout, loading, updateUserLocation }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
