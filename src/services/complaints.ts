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
    onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import type { Complaint, ComplaintStatus, TimelineEvent, AdminNote } from '../types';
import { analyzeComplaint } from './ai';

const COMPLAINTS_COLLECTION = 'complaints';

// Create a new complaint
export const createComplaint = async (
    userId: string,
    userName: string,
    userEmail: string,
    description: string,
    imageBase64?: string,  // Base64 encoded image string (compressed)
    isAnonymous: boolean = false
): Promise<string> => {
    // Get AI analysis (pass the Base64 image if provided)
    const aiAnalysis = await analyzeComplaint(description, imageBase64 || undefined);

    // Create initial timeline
    const timeline: Omit<TimelineEvent, 'id'>[] = [
        {
            action: 'Complaint Submitted',
            timestamp: Timestamp.now(),
            actor: isAnonymous ? 'Anonymous User' : userName,
            actorType: 'user',
            details: 'Your complaint was received',
            icon: '📝'
        },
        {
            action: 'AI Analysis Complete',
            timestamp: Timestamp.now(),
            actor: 'AI System',
            actorType: 'ai',
            details: `Category: ${aiAnalysis.category}, Priority: ${aiAnalysis.urgency}`,
            icon: '🤖'
        }
    ];

    const complaintData = {
        userId,
        userName: isAnonymous ? 'Anonymous' : userName,
        userEmail: isAnonymous ? 'hidden' : userEmail,
        description,
        imageUrl: imageBase64 || null,  // Stored as Base64 string
        isAnonymous,

        // AI Analysis
        category: aiAnalysis.category,
        urgency: aiAnalysis.urgency,
        priorityScore: aiAnalysis.priorityScore,
        priorityReason: aiAnalysis.priorityReason,
        aiSummary: aiAnalysis.aiSummary,
        suggestedAssignment: aiAnalysis.suggestedAssignment,
        statusExplanation: aiAnalysis.statusExplanation,
        detectedObjects: aiAnalysis.detectedObjects || [],

        // Status
        status: 'Pending' as ComplaintStatus,
        timeline: timeline.map((t, i) => ({ ...t, id: `tl_${i}` })),

        // Timestamps
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, COMPLAINTS_COLLECTION), complaintData);
    return docRef.id;
};

// Get user's complaints
export const getUserComplaints = async (userId: string): Promise<Complaint[]> => {
    const q = query(
        collection(db, COMPLAINTS_COLLECTION),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Complaint));
};

// Get all complaints (admin)
export const getAllComplaints = async (): Promise<Complaint[]> => {
    const q = query(
        collection(db, COMPLAINTS_COLLECTION),
        orderBy('priorityScore', 'desc'),
        orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Complaint));
};

// Get single complaint
export const getComplaint = async (complaintId: string): Promise<Complaint | null> => {
    const docRef = doc(db, COMPLAINTS_COLLECTION, complaintId);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as Complaint;
    }
    return null;
};

// Update complaint status
export const updateComplaintStatus = async (
    complaintId: string,
    newStatus: ComplaintStatus,
    adminName: string,
    statusExplanation?: string
): Promise<void> => {
    const docRef = doc(db, COMPLAINTS_COLLECTION, complaintId);
    const complaint = await getComplaint(complaintId);

    if (!complaint) return;

    const newTimelineEvent: TimelineEvent = {
        id: `tl_${Date.now()}`,
        action: `Status Updated to ${newStatus}`,
        timestamp: Timestamp.now(),
        actor: adminName,
        actorType: 'admin',
        details: statusExplanation || `Complaint has been marked as ${newStatus}`,
        icon: newStatus === 'Resolved' ? '✅' : newStatus === 'Escalated' ? '⚠️' : '📋'
    };

    const updateData: Partial<Complaint> = {
        status: newStatus,
        statusExplanation: statusExplanation || complaint.statusExplanation,
        timeline: [...complaint.timeline, newTimelineEvent],
        updatedAt: Timestamp.now()
    };

    if (newStatus === 'Resolved') {
        updateData.resolvedAt = Timestamp.now();
    }

    await updateDoc(docRef, updateData);
};

// Assign complaint
export const assignComplaint = async (
    complaintId: string,
    assignedTo: string,
    adminName: string
): Promise<void> => {
    const docRef = doc(db, COMPLAINTS_COLLECTION, complaintId);
    const complaint = await getComplaint(complaintId);

    if (!complaint) return;

    const newTimelineEvent: TimelineEvent = {
        id: `tl_${Date.now()}`,
        action: `Assigned to ${assignedTo}`,
        timestamp: Timestamp.now(),
        actor: adminName,
        actorType: 'admin',
        details: `Complaint has been assigned to ${assignedTo}`,
        icon: '👤'
    };

    await updateDoc(docRef, {
        assignedTo,
        status: 'In Progress',
        timeline: [...complaint.timeline, newTimelineEvent],
        updatedAt: serverTimestamp()
    });
};

// Add admin note
export const addAdminNote = async (
    complaintId: string,
    text: string,
    adminId: string,
    adminName: string
): Promise<void> => {
    const docRef = doc(db, COMPLAINTS_COLLECTION, complaintId);
    const complaint = await getComplaint(complaintId);

    if (!complaint) return;

    const newNote: AdminNote = {
        id: `note_${Date.now()}`,
        text,
        createdBy: adminId,
        createdByName: adminName,
        createdAt: Timestamp.now()
    };

    const existingNotes = complaint.adminNotes || [];

    await updateDoc(docRef, {
        adminNotes: [...existingNotes, newNote],
        updatedAt: serverTimestamp()
    });
};

// Add user feedback
export const addUserFeedback = async (
    complaintId: string,
    rating: number,
    feedback?: string
): Promise<void> => {
    const docRef = doc(db, COMPLAINTS_COLLECTION, complaintId);

    await updateDoc(docRef, {
        userRating: rating,
        userFeedback: feedback || null,
        updatedAt: serverTimestamp()
    });
};

// Subscribe to user's complaints (real-time)
export const subscribeToUserComplaints = (
    userId: string,
    callback: (complaints: Complaint[]) => void
): (() => void) => {
    const q = query(
        collection(db, COMPLAINTS_COLLECTION),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const complaints = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Complaint));
        callback(complaints);
    });
};

// Subscribe to all complaints (admin, real-time)
export const subscribeToAllComplaints = (
    callback: (complaints: Complaint[]) => void
): (() => void) => {
    const q = query(
        collection(db, COMPLAINTS_COLLECTION),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const complaints = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Complaint));
        // Sort by priority score on client side
        complaints.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
        callback(complaints);
    });
};

// Get complaints stats for user
export const getUserStats = async (userId: string) => {
    const complaints = await getUserComplaints(userId);

    const stats = {
        total: complaints.length,
        pending: complaints.filter(c => c.status === 'Pending').length,
        inProgress: complaints.filter(c => c.status === 'In Progress').length,
        resolved: complaints.filter(c => c.status === 'Resolved').length,
        escalated: complaints.filter(c => c.status === 'Escalated').length
    };

    return stats;
};

// Get admin dashboard stats
export const getAdminStats = async () => {
    const complaints = await getAllComplaints();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = {
        total: complaints.length,
        highPriority: complaints.filter(c => c.priorityScore >= 80).length,
        pending: complaints.filter(c => c.status === 'Pending').length,
        resolvedToday: complaints.filter(c => {
            if (!c.resolvedAt) return false;
            const resolvedDate = c.resolvedAt.toDate();
            return resolvedDate >= today;
        }).length,
        todayTotal: complaints.filter(c => {
            const createdDate = c.createdAt?.toDate();
            return createdDate && createdDate >= today;
        }).length
    };

    return stats;
};
