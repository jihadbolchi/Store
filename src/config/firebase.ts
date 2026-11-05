/**
 * Firebase Configuration & Initialization for Dhaka Art Nook
 * Connected to Firebase Project: dhaka-art-nook-1
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyDxq8fI0giE1ZqPUYk6QD-JhlkjSAbUVFI",
  authDomain: "dhaka-art-nook-1.firebaseapp.com",
  projectId: "dhaka-art-nook-1",
  storageBucket: "dhaka-art-nook-1.firebasestorage.app",
  messagingSenderId: "1093319368094",
  appId: "1:1093319368094:web:7f94d9b293ecb64e610a8f",
  measurementId: "G-P761Z1ELRC",
};

// Initialize or retrieve existing Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Authentication instance
export const auth = getAuth(app);

// Firestore instance
export const db = getFirestore(app);

export type { FirebaseUser };
