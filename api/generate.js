import { GoogleGenerativeAI } from '@google/generative-ai';

export const config = {
    maxDuration: 30,
};

const MODELS = ['gemini-3.8-flash', 'gemini-flash-latest'];

async function generateWithFallback(genAI, prompt) {
    let lastError;

    for (const modelName of MODELS) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (err) {
            lastError = err;
            const message = err?.message || '';
            const shouldTryNextModel =
                message.includes('404') ||
                message.includes('not found') ||
                message.includes('503') ||
                message.includes('Service Unavailable') ||
                message.includes('overloaded') ||
                message.includes('429');

            if (!shouldTryNextModel) {
                throw err;
            }
        }
    }

    throw lastError;
}

export default async function handler(req, res) {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Server API key not configured' });
        }

        const { type, input } = req.body || {};
        if (!input || !input.trim()) {
            return res.status(400).json({ error: 'Please enter some information' });
        }

        const prompt =
            type === 'letter'
                ? `Create a professional cover letter based on this job posting : ${input}`
                : `Create a professional resume based on this job posting: ${input}`;

        const genAI = new GoogleGenerativeAI(apiKey);
        const text = await generateWithFallback(genAI, prompt);

        return res.status(200).json({ text });
    } catch (err) {
        console.error('Server error in /api/generate:', err);
        const message = err?.message || 'Unexpected server error';

        if (message.includes('503') || message.includes('Service Unavailable')) {
            return res.status(503).json({
                error: 'The AI service is temporarily busy. Please try again in a few seconds.',
            });
        }

        if (message.includes('quota') || message.includes('429')) {
            return res.status(429).json({
                error: 'Rate limit exceeded. Please wait a minute and try again.',
            });
        }

        return res.status(500).json({ error: message });
    }
}