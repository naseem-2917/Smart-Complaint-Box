import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: "AIzaSyDcT2pW5WvbA0AnjrPc4ChMedNreq7zBws",
    authDomain: "smart-complaint-box-2025.firebaseapp.com",
    projectId: "smart-complaint-box-2025",
    storageBucket: "smart-complaint-box-2025.firebasestorage.app",
    messagingSenderId: "235301646086",
    appId: "1:235301646086:web:e7ea2ce28825c846633887"
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
