import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: "AIzaSyBrGHSUlHBO8LYtGWuwuqyF3z07Xc5vXY4",
    authDomain: "smart-complaint-box-c29f9.firebaseapp.com",
    projectId: "smart-complaint-box-c29f9",
    storageBucket: "smart-complaint-box-c29f9.firebasestorage.app",
    messagingSenderId: "936731618092",
    appId: "1:936731618092:web:4fc22bca8dc94b761b9a89",
measurementId: "G-1QHHYXC9FV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

export default app;
