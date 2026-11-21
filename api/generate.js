import { GoogleGenerativeAI } from '@google/generative-ai';

export const config = {
    maxDuration: 60,
};

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

        const trimmedInput = input.trim().slice(0, 6000);

        const prompt =
            type === 'letter'
                ? `Write a concise, tailored professional cover letter (max 350 words) based on this job posting/info:\n${trimmedInput}`
                : `Create a concise, well-structured, ATS-friendly resume based on this information/target role:\n${trimmedInput}`;

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-3.8-flash',
            generationConfig: {
                maxOutputTokens: 1500,
                temperature: 0.5,
            },
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return res.status(200).json({ text });
    } catch (err) {
        console.error('Error in /api/generate:', err);
        const message = err?.message || 'Unexpected error';

        if (message.includes('503') || message.includes('Service Unavailable') || message.includes('overloaded')) {
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