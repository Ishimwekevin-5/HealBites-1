import { useState, useEffect } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { UserProfile } from '../types';

import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);

import { handleFirestoreError, OperationType } from '../lib/firebase-utils';

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const path = `users/${firebaseUser.uid}`;
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as UserProfile);
          } else {
            // Create new user profile
            const newUser: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Healthy Eater',
              photoURL: firebaseUser.photoURL || undefined,
              dietType: 'None',
              weightGoal: 'Maintain',
              healthPreferences: [],
              createdAt: new Date().toISOString(),
              role: firebaseUser.email === 'ishimwekevin199@gmail.com' ? 'admin' : 'user'
            };
            try {
              await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
            } catch (error) {
              handleFirestoreError(error, OperationType.WRITE, path);
            }
            setUser(newUser);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, path);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request') {
        console.warn("Sign-in popup was cancelled by a new request.");
      } else if (error.code === 'auth/popup-closed-by-user') {
        console.warn("Sign-in popup was closed by the user.");
      } else {
        console.error("Error signing in", error);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const isAdmin = user?.role === 'admin' || user?.email === 'ishimwekevin199@gmail.com';

  return { user, loading, isSigningIn, signIn, logout, isAdmin };
}
