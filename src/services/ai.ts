const CLOUDFLARE_WORKER_URL = 'https://complaintbox.khannaseem1704.workers.dev';

import type { AIAnalysisResponse, LiveAnalysisResponse, Complaint } from '../types';

// Live analysis while user is typing (debounced)
export const liveAnalyze = async (partialText: string): Promise<LiveAnalysisResponse> => {
    try {
        const response = await fetch(`${CLOUDFLARE_WORKER_URL}/live-analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: partialText })
        });

        if (!response.ok) {
            throw new Error('Live analysis failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Live analysis error:', error);
        return {
            category: 'General',
            priority: 'Medium',
            suggestedImage: ''
        };
    }
};

// Full complaint analysis on submit
export const analyzeComplaint = async (
    description: string,
    imageUrl?: string
): Promise<AIAnalysisResponse> => {
    try {
        const response = await fetch(`${CLOUDFLARE_WORKER_URL}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description, imageUrl })
        });

        if (!response.ok) {
            throw new Error('Complaint analysis failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Analysis error:', error);
        // Return default values if API fails
        return {
            category: 'General',
            urgency: 'Medium',
            priorityScore: 50,
            priorityReason: ['Unable to analyze - using defaults'],
            aiSummary: description.slice(0, 100) + '...',
            suggestedAssignment: 'General Support',
            statusExplanation: 'Your complaint has been received and will be reviewed shortly.'
        };
    }
};

// Get human-friendly status explanation
export const getStatusExplanation = async (
    complaint: Partial<Complaint>,
    status: string
): Promise<string> => {
    try {
        const response = await fetch(`${CLOUDFLARE_WORKER_URL}/status-explain`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ complaint, status })
        });

        if (!response.ok) {
            throw new Error('Status explanation failed');
        }

        const data = await response.json();
        return data.explanation;
    } catch (error) {
        console.error('Status explanation error:', error);
        return getDefaultStatusExplanation(status);
    }
};

// Generate email draft
export const generateEmail = async (
    complaint: Partial<Complaint>,
    type: 'strict' | 'friendly' | 'report'
): Promise<string> => {
    try {
        const response = await fetch(`${CLOUDFLARE_WORKER_URL}/generate-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ complaint, type })
        });

        if (!response.ok) {
            throw new Error('Email generation failed');
        }

        const data = await response.json();
        return data.email;
    } catch (error) {
        console.error('Email generation error:', error);
        return `Subject: Complaint #${complaint.id}\n\nDear Authority,\n\nPlease review the following complaint:\n\n${complaint.description}\n\nCategory: ${complaint.category}\nUrgency: ${complaint.urgency}\n\nBest regards`;
    }
};

// User AI chat
export const chatWithAI = async (
    userId: string,
    query: string,
    complaints: Partial<Complaint>[]
): Promise<string> => {
    try {
        const response = await fetch(`${CLOUDFLARE_WORKER_URL}/user-chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, query, complaints })
        });

        if (!response.ok) {
            throw new Error('Chat failed');
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error('Chat error:', error);
        return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
    }
};

// Generate personal report
export const generatePersonalReport = async (
    userId: string,
    complaints: Partial<Complaint>[]
): Promise<{ summary: string; stats: Record<string, number>; insights: string[] }> => {
    try {
        const response = await fetch(`${CLOUDFLARE_WORKER_URL}/personal-report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, complaints })
        });

        if (!response.ok) {
            throw new Error('Report generation failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Report error:', error);
        return {
            summary: 'Unable to generate report at this time.',
            stats: {},
            insights: []
        };
    }
};

// Admin insights
export const getAdminInsights = async (
    complaints: Partial<Complaint>[]
): Promise<{ mostCommonIssue: string; hotspotArea: string; trends: string }> => {
    try {
        const response = await fetch(`${CLOUDFLARE_WORKER_URL}/admin-insights`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ complaints })
        });

        if (!response.ok) {
            throw new Error('Insights generation failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Insights error:', error);
        return {
            mostCommonIssue: 'General Issues',
            hotspotArea: 'Unknown',
            trends: 'Unable to analyze trends'
        };
    }
};

// Generate follow-up reminder
export const generateReminder = async (complaint: Partial<Complaint>): Promise<string> => {
    try {
        const response = await fetch(`${CLOUDFLARE_WORKER_URL}/generate-reminder`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ complaint })
        });

        if (!response.ok) {
            throw new Error('Reminder generation failed');
        }

        const data = await response.json();
        return data.reminder;
    } catch (error) {
        console.error('Reminder error:', error);
        return 'A polite reminder about your pending complaint. Please review at your earliest convenience.';
    }
};

// Helper function for default status explanations
function getDefaultStatusExplanation(status: string): string {
    const explanations: Record<string, string> = {
        'Pending': 'Your complaint has been received and is waiting to be assigned to the appropriate team.',
        'In Progress': 'Good news! Your complaint is being actively worked on by our team.',
        'Resolved': 'Great news! Your complaint has been successfully resolved.',
        'Escalated': 'Your complaint has been escalated to higher authorities for urgent attention.'
    };
    return explanations[status] || 'Status update pending.';
}
