const CLOUDFLARE_WORKER_URL = 'https://complaintbox.khannaseem1704.workers.dev';

import type { AIAnalysisResponse, LiveAnalysisResponse, Complaint } from '../types';

// Helper to call the new generic worker
async function callAI(prompt: string, systemInstruction: string): Promise<string> {
    const response = await fetch(CLOUDFLARE_WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, systemInstruction })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'AI request failed');
    }

    const data = await response.json();

    // Extract text from Gemini response format
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
    }

    throw new Error('Invalid AI response format');
}

// Parse JSON from AI response (handles markdown code blocks)
function parseJSON(text: string): any {
    try {
        // Remove markdown code blocks if present
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return null;
    } catch {
        return null;
    }
}

// Live analysis while user is typing (debounced)
export const liveAnalyze = async (partialText: string): Promise<LiveAnalysisResponse> => {
    try {
        const systemInstruction = `You are a complaint analyzer. Analyze the text and respond ONLY with valid JSON, no other text.`;

        const prompt = `Analyze this complaint text:
"${partialText}"

First check if this is a VALID complaint (meaningful text about an issue).
If it's gibberish, random characters, test text, or not a real complaint, set isValid to false.

Respond with JSON only:
{
  "isValid": true/false (false if gibberish like "asdfgh", "test123", random letters, or not a real complaint),
  "category": "one of: Water Supply, Electricity, Roads & Infrastructure, Sanitation, Security, Classroom, General, Other",
  "priority": "one of: Low, Medium, High, Critical",
  "suggestedImage": "brief suggestion for what photo would help, or empty string"
}`;

        const response = await callAI(prompt, systemInstruction);
        const parsed = parseJSON(response);

        return parsed || {
            isValid: false,
            category: 'General',
            priority: 'Medium',
            suggestedImage: ''
        };
    } catch (error) {
        console.error('Live analysis error:', error);
        return {
            isValid: false,
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
        const systemInstruction = `You are an AI complaint analyzer for a college/society complaint management system. Analyze complaints and respond ONLY with valid JSON.`;

        const prompt = `Analyze this complaint:
Description: "${description}"
${imageUrl ? `Image attached: yes` : 'No image attached'}

Respond with JSON only:
{
  "category": "one of: Water Supply, Electricity, Roads & Infrastructure, Sanitation, Security, Classroom, General, Other",
  "urgency": "one of: Low, Medium, High, Critical",
  "priorityScore": number 0-100,
  "priorityReason": ["reason1", "reason2"],
  "aiSummary": "1-2 sentence summary",
  "suggestedAssignment": "department or role",
  "statusExplanation": "reassuring message for user"
}

Priority factors: safety hazards=very high, water/electricity=high, multiple people affected=higher, urgent language=higher`;

        const response = await callAI(prompt, systemInstruction);
        const parsed = parseJSON(response);

        return parsed || {
            category: 'General',
            urgency: 'Medium',
            priorityScore: 50,
            priorityReason: ['Unable to analyze - using defaults'],
            aiSummary: description.slice(0, 100) + '...',
            suggestedAssignment: 'General Support',
            statusExplanation: 'Your complaint has been received and will be reviewed shortly.'
        };
    } catch (error) {
        console.error('Analysis error:', error);
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
        const systemInstruction = `You are a friendly customer support assistant. Write warm, reassuring messages.`;

        const prompt = `Generate a friendly explanation for this complaint status update:

Complaint: "${complaint.description?.slice(0, 200) || 'General complaint'}"
Category: ${complaint.category || 'General'}
New Status: ${status}

Write 2-3 sentences that are warm, reassuring, explain what this status means, and set appropriate expectations. Just the explanation text, no JSON.`;

        const response = await callAI(prompt, systemInstruction);
        return response.trim();
    } catch (error) {
        console.error('Status explanation error:', error);
        return getDefaultStatusExplanation(status);
    }
};

// Generate email draft - SHORT and CONCISE
export const generateEmail = async (
    complaint: Partial<Complaint>,
    type: 'strict' | 'friendly' | 'report'
): Promise<string> => {
    const info = `Category: ${complaint.category}, Issue: ${complaint.description?.slice(0, 100)}`;

    try {
        let sys = '';
        let prompt = '';

        if (type === 'strict') {
            sys = 'Write very short, firm emails. Max 5 lines.';
            prompt = `Write a SHORT strict email demanding action for: ${info}. Include subject, 2-3 sentences demanding resolution in 24hrs, signature. KEEP IT VERY SHORT.`;

        } else if (type === 'friendly') {
            sys = 'Write very short, friendly reminder emails. Max 5 lines.';
            prompt = `Write a SHORT friendly reminder for: ${info}. Include subject, 2-3 polite sentences requesting update, warm signature. KEEP IT VERY SHORT.`;

        } else {
            sys = 'Write brief, factual reports. Max 8 lines.';
            prompt = `Write a SHORT report summary for: ${info}. Include: Title, Category, Status: ${complaint.status}, Brief description, Date. KEEP IT VERY SHORT.`;
        }

        const response = await callAI(prompt, sys);
        if (response && response.length > 50) {
            return response.trim();
        }
        throw new Error('Response too short');
    } catch (error) {
        console.error('Email generation error:', error);

        // Short fallback templates
        if (type === 'strict') {
            return `Subject: URGENT - ${complaint.category} Complaint

Dear Sir/Madam,

Issue: ${complaint.description?.slice(0, 100)}

Resolve within 24 hours or this will be escalated.

Regards`;
        } else if (type === 'friendly') {
            return `Subject: Quick Follow-up 😊

Hi Team!

Just checking on my ${complaint.category} complaint. Any update?

Thanks!`;
        } else {
            return `REPORT: ${complaint.category}
Status: ${complaint.status}
Priority: ${complaint.urgency}
Issue: ${complaint.description?.slice(0, 100)}
Date: ${new Date().toLocaleDateString()}`;
        }
    }
};

// User AI chat
export const chatWithAI = async (
    _userId: string,
    query: string,
    complaints: Partial<Complaint>[]
): Promise<string> => {
    try {
        const complaintsContext = complaints
            ?.slice(0, 5)
            .map(c => `- ${c.category}: ${c.status} (${c.aiSummary || c.description?.slice(0, 50)})`)
            .join('\n') || 'No complaints';

        const systemInstruction = `You are a helpful AI assistant for a complaint management system. Be friendly and concise.`;

        const prompt = `User's recent complaints:
${complaintsContext}

User asks: "${query}"

Provide a helpful, friendly response (2-4 sentences max). If you don't have information, say so politely.`;

        const response = await callAI(prompt, systemInstruction);
        return response.trim();
    } catch (error) {
        console.error('Chat error:', error);
        return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
    }
};

// Generate personal report
export const generatePersonalReport = async (
    _userId: string,
    complaints: Partial<Complaint>[]
): Promise<{ summary: string; stats: Record<string, number>; insights: string[] }> => {
    const stats = {
        total: complaints?.length || 0,
        resolved: complaints?.filter(c => c.status === 'Resolved').length || 0,
        pending: complaints?.filter(c => c.status === 'Pending').length || 0,
        inProgress: complaints?.filter(c => c.status === 'In Progress').length || 0
    };

    try {
        const systemInstruction = `You are a report generator. Respond ONLY with valid JSON.`;

        const prompt = `Generate a brief report summary:

Stats:
- Total complaints: ${stats.total}
- Resolved: ${stats.resolved}
- Pending: ${stats.pending}
- In Progress: ${stats.inProgress}

Respond with JSON only:
{
  "summary": "2-3 sentence friendly summary",
  "insights": ["insight 1", "insight 2"]
}`;

        const response = await callAI(prompt, systemInstruction);
        const parsed = parseJSON(response);

        return {
            summary: parsed?.summary || 'No activity to report.',
            stats,
            insights: parsed?.insights || []
        };
    } catch (error) {
        console.error('Report error:', error);
        return {
            summary: 'Unable to generate report at this time.',
            stats,
            insights: []
        };
    }
};

// Admin insights
export const getAdminInsights = async (
    complaints: Partial<Complaint>[]
): Promise<{ mostCommonIssue: string; hotspotArea: string; trends: string }> => {
    const categories: Record<string, number> = {};
    complaints?.forEach(c => {
        if (c.category) {
            categories[c.category] = (categories[c.category] || 0) + 1;
        }
    });

    const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];

    try {
        const systemInstruction = `You are an admin analytics assistant. Respond ONLY with valid JSON.`;

        const prompt = `Analyze this complaint data:

- Total complaints: ${complaints?.length || 0}
- Top category: ${topCategory?.[0] || 'N/A'} (${topCategory?.[1] || 0} complaints)
- Pending: ${complaints?.filter(c => c.status === 'Pending').length || 0}
- Categories: ${Object.entries(categories).map(([k, v]) => `${k}: ${v}`).join(', ')}

Respond with JSON only:
{
  "mostCommonIssue": "brief description of most common issue",
  "hotspotArea": "area or department with most issues",
  "trends": "brief trend observation"
}`;

        const response = await callAI(prompt, systemInstruction);
        const parsed = parseJSON(response);

        return parsed || {
            mostCommonIssue: topCategory?.[0] || 'General Issues',
            hotspotArea: 'Analysis pending',
            trends: 'Insufficient data'
        };
    } catch (error) {
        console.error('Insights error:', error);
        return {
            mostCommonIssue: topCategory?.[0] || 'General Issues',
            hotspotArea: 'Unknown',
            trends: 'Unable to analyze trends'
        };
    }
};

// Generate follow-up reminder
export const generateReminder = async (complaint: Partial<Complaint>): Promise<string> => {
    try {
        const systemInstruction = `You are a polite reminder assistant. Write brief, professional reminders.`;

        const daysPending = complaint.createdAt
            ? Math.floor((Date.now() - (complaint.createdAt as any)?.toDate?.().getTime?.() || Date.now()) / (1000 * 60 * 60 * 24))
            : 0;

        const prompt = `Generate a polite follow-up reminder:

Complaint: ${complaint.category} - ${complaint.aiSummary || complaint.description?.slice(0, 100)}
Days pending: approximately ${daysPending} days

Write a short, polite reminder (2-3 sentences) requesting status update.`;

        const response = await callAI(prompt, systemInstruction);
        return response.trim();
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
