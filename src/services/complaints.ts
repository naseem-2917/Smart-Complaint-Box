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
import type { Complaint, ComplaintStatus, TimelineEvent, AdminNote, UrgencyLevel } from '../types';
import { analyzeComplaint } from './ai';

const COMPLAINTS_COLLECTION = 'complaints';

// Create a new complaint
export const createComplaint = async (
    userId: string,
    userName: string,
    userEmail: string,
    description: string,
    imageBase64?: string,  // Base64 encoded image string (compressed)
    isAnonymous: boolean = false,
    userUrgency?: UrgencyLevel  // User can override AI urgency
): Promise<string> => {
    // Get AI analysis (pass the Base64 image if provided)
    const aiAnalysis = await analyzeComplaint(description, imageBase64 || undefined);

    // Use user-provided urgency if available, otherwise use AI analysis
    const finalUrgency = userUrgency || aiAnalysis.urgency;

    // Adjust priority score if user overrides urgency
    let finalPriorityScore = aiAnalysis.priorityScore;
    if (userUrgency) {
        const urgencyScores: Record<UrgencyLevel, number> = {
            'Low': 25,
            'Medium': 50,
            'High': 75,
            'Critical': 95
        };
        finalPriorityScore = urgencyScores[userUrgency];
    }

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
            details: `Category: ${aiAnalysis.category}, Priority: ${finalUrgency}${userUrgency ? ' (User Override)' : ''}`,
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

        // AI Analysis (with possible user override)
        category: aiAnalysis.category,
        urgency: finalUrgency,
        priorityScore: finalPriorityScore,
        priorityReason: userUrgency
            ? [...aiAnalysis.priorityReason, 'User manually set priority']
            : aiAnalysis.priorityReason,
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

// Create complaint with manual category and priority selection (no AI)
export const createComplaintManual = async (
    userId: string,
    userName: string,
    userEmail: string,
    description: string,
    category: string,
    urgency: UrgencyLevel,
    imageBase64?: string,
    isAnonymous: boolean = false
): Promise<string> => {
    // Calculate priority score based on urgency
    const urgencyScores: Record<UrgencyLevel, number> = {
        'Low': 25,
        'Medium': 50,
        'High': 75,
        'Critical': 95
    };
    const priorityScore = urgencyScores[urgency];

    // Create initial timeline
    const timeline: Omit<TimelineEvent, 'id'>[] = [
        {
            action: 'Complaint Submitted',
            timestamp: Timestamp.now(),
            actor: isAnonymous ? 'Anonymous User' : userName,
            actorType: 'user',
            details: `Category: ${category}, Priority: ${urgency}`,
            icon: '📝'
        }
    ];

    const complaintData = {
        userId,
        userName: isAnonymous ? 'Anonymous' : userName,
        userEmail: isAnonymous ? 'hidden' : userEmail,
        description,
        imageUrl: imageBase64 || null,
        isAnonymous,

        // Manual selection
        category,
        urgency,
        priorityScore,
        priorityReason: ['User selected priority'],
        aiSummary: description.slice(0, 100) + '...',
        suggestedAssignment: 'General Support',
        statusExplanation: 'Your complaint has been received and is pending review.',
        detectedObjects: [],

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
        orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const complaints = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Complaint));

    // Sort by priority score on client side to avoid needing composite index
    complaints.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
    return complaints;
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
    callback: (complaints: Complaint[]) => void,
    onError?: (error: Error) => void
): (() => void) => {
    const q = query(
        collection(db, COMPLAINTS_COLLECTION),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const complaints = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Complaint));
            callback(complaints);
        },
        (error) => {
            console.error('User complaints subscription error:', error);
            onError?.(error);
        }
    );
};

// Subscribe to all complaints (admin, real-time)
export const subscribeToAllComplaints = (
    callback: (complaints: Complaint[]) => void,
    onError?: (error: Error) => void
): (() => void) => {
    const q = query(
        collection(db, COMPLAINTS_COLLECTION),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const complaints = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Complaint));
            // Sort by priority score on client side
            complaints.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
            callback(complaints);
        },
        (error) => {
            console.error('All complaints subscription error:', error);
            onError?.(error);
        }
    );
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
