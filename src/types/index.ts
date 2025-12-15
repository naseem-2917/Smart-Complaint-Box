import { Timestamp } from 'firebase/firestore';

// User Types
export interface User {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    role: 'user' | 'admin';
    createdAt: Timestamp;
}

// Complaint Types
export type ComplaintStatus = 'Pending' | 'In Progress' | 'Resolved' | 'Escalated';
export type UrgencyLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface DetectedObject {
    label: string;
    confidence: number;
}

export interface TimelineEvent {
    id: string;
    action: string;
    timestamp: Timestamp;
    actor: string;
    actorType: 'user' | 'ai' | 'admin' | 'system';
    details?: string;
    icon?: string;
}

export interface AdminNote {
    id: string;
    text: string;
    createdBy: string;
    createdByName: string;
    createdAt: Timestamp;
}

export interface Complaint {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    description: string;
    imageUrl?: string;
    isAnonymous: boolean;

    // AI Analysis
    category: string;
    urgency: UrgencyLevel;
    priorityScore: number;
    priorityReason: string[];
    aiSummary: string;
    suggestedAssignment: string;
    statusExplanation: string;

    // Image Intelligence
    detectedObjects?: DetectedObject[];

    // Status & Timeline
    status: ComplaintStatus;
    timeline: TimelineEvent[];

    // Admin
    adminNotes?: AdminNote[];
    assignedTo?: string;

    // Feedback
    userRating?: number;
    userFeedback?: string;

    createdAt: Timestamp;
    updatedAt: Timestamp;
    resolvedAt?: Timestamp;
}

// Dashboard Types
export interface UserStats {
    totalComplaints: number;
    resolved: number;
    pending: number;
    inProgress: number;
    escalated: number;
    avgResolutionTime: string;
    satisfactionRate: number;
}

export interface AdminStats {
    totalComplaints: number;
    highPriority: number;
    pending: number;
    resolvedToday: number;
    todayTotal: number;
}

export interface AIInsights {
    mostCommonIssue: string;
    hotspotArea: string;
    unresolvedCount: number;
    avgResolutionTime: string;
    trendPercentage: number;
}

// Chat Types
export interface ChatMessage {
    id: string;
    role: 'user' | 'ai';
    content: string;
    timestamp: Timestamp;
}

// Analytics Types
export interface CategoryData {
    name: string;
    value: number;
    color: string;
}

export interface TrendData {
    date: string;
    complaints: number;
    resolved: number;
}

// API Response Types
export interface AIAnalysisResponse {
    category: string;
    urgency: UrgencyLevel;
    priorityScore: number;
    priorityReason: string[];
    aiSummary: string;
    suggestedAssignment: string;
    statusExplanation: string;
    detectedObjects?: DetectedObject[];
}

export interface LiveAnalysisResponse {
    category: string;
    priority: UrgencyLevel;
    suggestedImage: string;
}

// Form Types
export interface ComplaintFormData {
    description: string;
    image?: File | null;
    isAnonymous: boolean;
}

// Notification Types
export interface Toast {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
}
