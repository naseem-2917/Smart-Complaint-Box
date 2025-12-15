/**
 * Smart Complaint Box - Cloudflare Worker
 * 
 * This worker acts as a proxy for the Gemini API to keep the API key secure.
 * Deploy this to Cloudflare Workers with your Gemini API key as an environment variable.
 * 
 * Environment Variables Required:
 * - GEMINI_API_KEY: Your Google Gemini API key
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// CORS headers for all responses
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

// Handle OPTIONS preflight requests
function handleOptions() {
    return new Response(null, { headers: corsHeaders });
}

// Call Gemini API
async function callGemini(prompt, apiKey) {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1024,
            },
        }),
    });

    const data = await response.json();

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
    }

    throw new Error('Invalid response from Gemini API');
}

// Parse JSON from Gemini response
function parseJSON(text) {
    try {
        // Try to extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return null;
    } catch {
        return null;
    }
}

// Handlers for each endpoint
const handlers = {
    // Live analysis while typing
    async 'live-analyze'(body, apiKey) {
        const { text } = body;

        const prompt = `Analyze this complaint text and provide quick categorization.
Text: "${text}"

Respond in JSON format only:
{
  "category": "one of: Plumbing, Electrical, Infrastructure, Cleanliness, Security, IT/Network, Food, Transportation, Other",
  "priority": "one of: Low, Medium, High, Critical",
  "suggestedImage": "brief suggestion for what photo would help, or empty string if not needed"
}`;

        const response = await callGemini(prompt, apiKey);
        const parsed = parseJSON(response);

        return parsed || {
            category: 'General',
            priority: 'Medium',
            suggestedImage: ''
        };
    },

    // Full complaint analysis
    async 'analyze'(body, apiKey) {
        const { description, imageUrl } = body;

        const prompt = `You are an AI complaint analyzer for a college/society complaint management system.
    
Analyze this complaint:
Description: "${description}"
${imageUrl ? `Image URL: ${imageUrl}` : 'No image attached'}

Provide a comprehensive analysis in JSON format:
{
  "category": "one of: Plumbing, Electrical, Infrastructure, Cleanliness, Security, IT/Network, Food, Transportation, Hostel, Academic, Other",
  "urgency": "one of: Low, Medium, High, Critical",
  "priorityScore": number between 0-100 based on urgency, impact, and safety concerns,
  "priorityReason": ["array of 2-3 short reasons for the priority score"],
  "aiSummary": "A brief 1-2 sentence summary of the complaint",
  "suggestedAssignment": "suggested department or role: Maintenance Staff, Electrician, Housekeeping, Security, IT Support, Admin Office, etc.",
  "statusExplanation": "A reassuring message explaining what will happen next, in friendly tone",
  "detectedObjects": [{"label": "string", "confidence": number 0-100}] // Only if image was mentioned
}

Consider these factors for priority:
- Safety hazards = very high priority
- Water/electricity issues = high priority
- Multiple people affected = higher priority
- Urgent language = higher priority
- Repeated issues = higher priority`;

        const response = await callGemini(prompt, apiKey);
        const parsed = parseJSON(response);

        return parsed || {
            category: 'General',
            urgency: 'Medium',
            priorityScore: 50,
            priorityReason: ['Standard complaint'],
            aiSummary: description.slice(0, 100),
            suggestedAssignment: 'General Support',
            statusExplanation: 'Your complaint has been received and will be reviewed shortly.'
        };
    },

    // Human-friendly status explanation
    async 'status-explain'(body, apiKey) {
        const { complaint, status } = body;

        const prompt = `Generate a friendly, reassuring explanation for a complaint status update.

Complaint: "${complaint.description?.slice(0, 200) || 'General complaint'}"
Category: ${complaint.category || 'General'}
New Status: ${status}

Write a 2-3 sentence explanation that:
- Is warm and reassuring
- Explains what this status means
- Sets appropriate expectations
- Uses simple language

Respond with just the explanation text, no JSON.`;

        const response = await callGemini(prompt, apiKey);
        return { explanation: response.trim() };
    },

    // Generate email draft
    async 'generate-email'(body, apiKey) {
        const { complaint, type } = body;

        const tones = {
            strict: 'formal and firm, emphasizing urgency and accountability',
            friendly: 'polite and gentle, serving as a friendly reminder',
            report: 'professional and factual, suitable for official documentation'
        };

        const prompt = `Generate an email draft for a complaint that is ${tones[type] || 'professional'}.

Complaint Details:
- Category: ${complaint.category}
- Priority: ${complaint.urgency}
- Description: ${complaint.description}
- Status: ${complaint.status}

Write a complete email with Subject line, greeting, body, and signature.
The email should be addressed to the relevant authority.`;

        const response = await callGemini(prompt, apiKey);
        return { email: response.trim() };
    },

    // User AI chat
    async 'user-chat'(body, apiKey) {
        const { query, complaints } = body;

        const complaintsContext = complaints
            ?.slice(0, 5)
            .map(c => `- ${c.category}: ${c.status} (${c.aiSummary || c.description?.slice(0, 50)})`)
            .join('\n') || 'No complaints';

        const prompt = `You are a helpful AI assistant for a complaint management system.
    
User's complaints:
${complaintsContext}

User asks: "${query}"

Provide a helpful, friendly response about their complaints, status, or general questions about the system.
Keep the response concise (2-4 sentences max).
If you don't have information, politely say so.`;

        const response = await callGemini(prompt, apiKey);
        return { response: response.trim() };
    },

    // Personal report
    async 'personal-report'(body, apiKey) {
        const { complaints } = body;

        const stats = {
            total: complaints?.length || 0,
            resolved: complaints?.filter(c => c.status === 'Resolved').length || 0,
            pending: complaints?.filter(c => c.status === 'Pending').length || 0
        };

        const prompt = `Generate a brief monthly report summary for a user.

Stats:
- Total complaints: ${stats.total}
- Resolved: ${stats.resolved}
- Pending: ${stats.pending}

Provide a friendly 2-3 sentence summary and insights.
Respond in JSON format:
{
  "summary": "Your monthly summary text",
  "insights": ["insight 1", "insight 2"]
}`;

        const response = await callGemini(prompt, apiKey);
        const parsed = parseJSON(response);

        return {
            summary: parsed?.summary || 'No activity this month.',
            stats,
            insights: parsed?.insights || []
        };
    },

    // Admin insights
    async 'admin-insights'(body, apiKey) {
        const { complaints } = body;

        const categories = {};
        complaints?.forEach(c => {
            categories[c.category] = (categories[c.category] || 0) + 1;
        });

        const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];

        const prompt = `Based on complaint data, provide brief admin insights.

Data:
- Total complaints: ${complaints?.length || 0}
- Top category: ${topCategory?.[0] || 'N/A'} (${topCategory?.[1] || 0} complaints)
- Pending: ${complaints?.filter(c => c.status === 'Pending').length || 0}

Respond in JSON:
{
  "mostCommonIssue": "brief description",
  "hotspotArea": "area or department with most issues",
  "trends": "brief trend observation"
}`;

        const response = await callGemini(prompt, apiKey);
        const parsed = parseJSON(response);

        return parsed || {
            mostCommonIssue: topCategory?.[0] || 'General Issues',
            hotspotArea: 'Analysis pending',
            trends: 'Insufficient data'
        };
    },

    // Generate follow-up reminder
    async 'generate-reminder'(body, apiKey) {
        const { complaint } = body;

        const prompt = `Generate a polite follow-up reminder for an unresolved complaint.

Complaint: ${complaint.category} - ${complaint.aiSummary || complaint.description?.slice(0, 100)}
Days pending: approximately ${Math.floor((Date.now() - (complaint.createdAt?._seconds * 1000 || Date.now())) / (1000 * 60 * 60 * 24))} days

Write a short, polite reminder (2-3 sentences) requesting status update.`;

        const response = await callGemini(prompt, apiKey);
        return { reminder: response.trim() };
    }
};

// Main request handler
export default {
    async fetch(request, env) {
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return handleOptions();
        }

        const url = new URL(request.url);
        const path = url.pathname.replace(/^\//, '');

        // Health check
        if (path === '' || path === 'health') {
            return new Response(JSON.stringify({ status: 'ok', endpoints: Object.keys(handlers) }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Check if endpoint exists
        if (!handlers[path]) {
            return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Only accept POST requests
        if (request.method !== 'POST') {
            return new Response(JSON.stringify({ error: 'Method not allowed' }), {
                status: 405,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        try {
            const body = await request.json();
            const apiKey = env.GEMINI_API_KEY;

            if (!apiKey) {
                throw new Error('GEMINI_API_KEY not configured');
            }

            const result = await handlers[path](body, apiKey);

            return new Response(JSON.stringify(result), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        } catch (error) {
            console.error('Error:', error);
            return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
    }
};
