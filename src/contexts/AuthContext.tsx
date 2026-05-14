'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User } from '@/types';

interface AuthContextType {
  user: (FirebaseUser & { appUser?: User }) | null;
  loading: boolean;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserLocation: (latitude: number, longitude: number, address: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<(FirebaseUser & { appUser?: User }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const appUser = userDoc.data() as User;
        setUser({ ...firebaseUser, appUser });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email: string, password: string, fullName: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const newUser: User = {
      id: result.user.uid,
      email,
      fullName,
      role: 'user',
      status: 'active',
      balance: 0,
      averpayId: `AP-${result.user.uid.slice(0, 8).toUpperCase()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await setDoc(doc(db, 'users', result.user.uid), newUser);
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  const updateUserLocation = async (latitude: number, longitude: number, address: string) => {
    if (!user) return;
    await setDoc(
      doc(db, 'users', user.uid),
      {
        location: { latitude, longitude, address, lastUpdated: Date.now() },
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, updateUserLocation }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
