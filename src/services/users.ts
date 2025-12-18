import {
    collection,
    doc,
    getDocs,
    getDoc,
    updateDoc,
    query,
    orderBy,
    where,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

export interface UserData {
    id: string;
    email: string;
    displayName: string;
    role: 'user' | 'admin';
    status: 'active' | 'blocked';
    complaintCount: number;
    photoURL?: string;
    createdAt: Timestamp;
    lastLogin?: Timestamp;
}

const USERS_COLLECTION = 'users';
const COMPLAINTS_COLLECTION = 'complaints';

// Get all users with actual complaint count from complaints collection
export const getAllUsers = async (): Promise<UserData[]> => {
    // Get all users
    const usersQuery = query(
        collection(db, USERS_COLLECTION),
        orderBy('createdAt', 'desc')
    );
    const usersSnapshot = await getDocs(usersQuery);

    // Get all complaints to count per user
    const complaintsSnapshot = await getDocs(collection(db, COMPLAINTS_COLLECTION));
    const complaintCounts: Record<string, number> = {};

    complaintsSnapshot.docs.forEach(doc => {
        const userId = doc.data().userId;
        if (userId) {
            complaintCounts[userId] = (complaintCounts[userId] || 0) + 1;
        }
    });

    return usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        complaintCount: complaintCounts[doc.id] || 0  // Use actual count
    } as UserData));
};

// Get users by role
export const getUsersByRole = async (role: 'user' | 'admin'): Promise<UserData[]> => {
    const q = query(
        collection(db, USERS_COLLECTION),
        where('role', '==', role)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as UserData));
};

// Get blocked users
export const getBlockedUsers = async (): Promise<UserData[]> => {
    const q = query(
        collection(db, USERS_COLLECTION),
        where('status', '==', 'blocked')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as UserData));
};

// Block user
export const blockUser = async (userId: string): Promise<void> => {
    await updateDoc(doc(db, USERS_COLLECTION, userId), {
        status: 'blocked',
        updatedAt: serverTimestamp()
    });
};

// Unblock user
export const unblockUser = async (userId: string): Promise<void> => {
    await updateDoc(doc(db, USERS_COLLECTION, userId), {
        status: 'active',
        updatedAt: serverTimestamp()
    });
};

// Make user admin
export const makeAdmin = async (userId: string): Promise<void> => {
    await updateDoc(doc(db, USERS_COLLECTION, userId), {
        role: 'admin',
        updatedAt: serverTimestamp()
    });
};

// Remove admin role
export const removeAdmin = async (userId: string): Promise<void> => {
    await updateDoc(doc(db, USERS_COLLECTION, userId), {
        role: 'user',
        updatedAt: serverTimestamp()
    });
};

// Get single user
export const getUser = async (userId: string): Promise<UserData | null> => {
    const docSnap = await getDoc(doc(db, USERS_COLLECTION, userId));
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as UserData;
    }
    return null;
};

// Increment user's complaint count
export const incrementUserComplaintCount = async (userId: string): Promise<void> => {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    if (userDoc.exists()) {
        const currentCount = userDoc.data().complaintCount || 0;
        await updateDoc(doc(db, USERS_COLLECTION, userId), {
            complaintCount: currentCount + 1
        });
    }
};

// Update user profile
export const updateUserProfile = async (
    userId: string,
    data: { displayName?: string }
): Promise<void> => {
    const updateData: Record<string, unknown> = {
        updatedAt: serverTimestamp()
    };

    if (data.displayName !== undefined) {
        updateData.displayName = data.displayName;
    }

    await updateDoc(doc(db, USERS_COLLECTION, userId), updateData);
};

