import {
    collection,
    doc,
    addDoc,
    updateDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp,
    arrayUnion,
    increment
} from 'firebase/firestore';
import { db } from './firebase';
import type { GroupComplaint, GroupComplaintSupporter, UrgencyLevel, ComplaintStatus } from '../types';

const GROUP_COMPLAINTS_COLLECTION = 'groupComplaints';

// Minimum supporters for "Dhamaka" status (2 for testing, will be 10 in production)
export const MIN_DHAMAKA_COUNT = 2;

// Link expiry in days
const LINK_EXPIRY_DAYS = 7;

/**
 * Create a new Group Complaint
 * Returns the complaint ID which is used in the shareable link
 */
export const createGroupComplaint = async (
    creatorId: string,
    creatorName: string,
    creatorEmail: string,
    title: string,
    description: string,
    category: string,
    urgency: UrgencyLevel,
    imageUrl?: string
): Promise<string> => {
    // Calculate expiry date (7 days from now)
    const now = new Date();
    const expiryDate = new Date(now.getTime() + LINK_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    const complaintData = {
        creatorId,
        creatorName,
        creatorEmail,
        title,
        description,
        category,
        urgency,
        imageUrl: imageUrl || '',

        // Supporters - start empty, creator is not auto-added
        supporters: [], // Array of user IDs
        supporterDetails: [], // Full supporter info
        supporterCount: 0,

        // Status
        status: 'Pending' as ComplaintStatus,
        isDhamaka: false,

        // Timestamps
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(expiryDate)
    };

    const docRef = await addDoc(collection(db, GROUP_COMPLAINTS_COLLECTION), complaintData);
    return docRef.id;
};

/**
 * Get a Group Complaint by ID
 */
export const getGroupComplaint = async (complaintId: string): Promise<GroupComplaint | null> => {
    const docRef = doc(db, GROUP_COMPLAINTS_COLLECTION, complaintId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) return null;

    const data = snap.data();

    // Check if expired
    if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
        return null; // Treat expired as not found
    }

    return { id: snap.id, ...data } as GroupComplaint;
};

/**
 * Check if user has already signed a complaint
 */
export const hasUserSigned = async (complaintId: string, userId: string): Promise<boolean> => {
    const complaint = await getGroupComplaint(complaintId);
    if (!complaint) return false;
    return complaint.supporters.includes(userId);
};

/**
 * Sign (support) a Group Complaint
 * Uses Firestore's arrayUnion for atomic updates
 */
export const signGroupComplaint = async (
    complaintId: string,
    userId: string,
    userName: string,
    userEmail: string
): Promise<{ success: boolean; error?: string; newCount?: number }> => {
    try {
        const complaintRef = doc(db, GROUP_COMPLAINTS_COLLECTION, complaintId);
        const snap = await getDoc(complaintRef);

        if (!snap.exists()) {
            return { success: false, error: 'Complaint not found' };
        }

        const data = snap.data();

        // Check expiry
        if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
            return { success: false, error: 'This petition link has expired' };
        }

        // Check if already signed
        if (data.supporters && data.supporters.includes(userId)) {
            return { success: false, error: 'You have already signed this petition!' };
        }

        // Check if creator is trying to sign (creator cannot sign their own)
        if (data.creatorId === userId) {
            return { success: false, error: 'You cannot sign your own petition' };
        }

        const supporterInfo: GroupComplaintSupporter = {
            userId,
            userName,
            userEmail,
            signedAt: Timestamp.now()
        };

        const newCount = (data.supporterCount || 0) + 1;
        const isDhamaka = newCount >= MIN_DHAMAKA_COUNT;

        // Atomic update
        await updateDoc(complaintRef, {
            supporters: arrayUnion(userId),
            supporterDetails: arrayUnion(supporterInfo),
            supporterCount: increment(1),
            isDhamaka,
            updatedAt: serverTimestamp()
        });

        return { success: true, newCount };
    } catch (error) {
        console.error('Error signing complaint:', error);
        return { success: false, error: 'Failed to sign. Please try again.' };
    }
};

/**
 * Get all Group Complaints (for admin)
 */
export const getAllGroupComplaints = async (): Promise<GroupComplaint[]> => {
    const q = query(
        collection(db, GROUP_COMPLAINTS_COLLECTION),
        orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as GroupComplaint[];
};

/**
 * Get Group Complaints by status (for admin filtering)
 */
export const getGroupComplaintsByStatus = async (status: ComplaintStatus): Promise<GroupComplaint[]> => {
    const q = query(
        collection(db, GROUP_COMPLAINTS_COLLECTION),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as GroupComplaint[];
};

/**
 * Get only "Dhamaka" complaints (for admin highlight)
 */
export const getDhamakaComplaints = async (): Promise<GroupComplaint[]> => {
    const q = query(
        collection(db, GROUP_COMPLAINTS_COLLECTION),
        where('isDhamaka', '==', true),
        orderBy('supporterCount', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as GroupComplaint[];
};

/**
 * Update Group Complaint status (admin only)
 */
export const updateGroupComplaintStatus = async (
    complaintId: string,
    status: ComplaintStatus
): Promise<void> => {
    const complaintRef = doc(db, GROUP_COMPLAINTS_COLLECTION, complaintId);
    await updateDoc(complaintRef, {
        status,
        updatedAt: serverTimestamp()
    });
};

/**
 * Get Group Complaints created by a specific user
 */
export const getMyGroupComplaints = async (userId: string): Promise<GroupComplaint[]> => {
    const q = query(
        collection(db, GROUP_COMPLAINTS_COLLECTION),
        where('creatorId', '==', userId),
        orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as GroupComplaint[];
};

/**
 * Get Group Complaints signed by a specific user
 */
export const getSignedGroupComplaints = async (userId: string): Promise<GroupComplaint[]> => {
    const q = query(
        collection(db, GROUP_COMPLAINTS_COLLECTION),
        where('supporters', 'array-contains', userId),
        orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as GroupComplaint[];
};
