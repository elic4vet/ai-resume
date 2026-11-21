import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Server API key not configured' });
    }

    const { input } = req.body || {};
    if (!input || !input.trim()) {
        return res.status(400).json({ error: 'Please enter some information' });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-flash-latest',
        });

        const prompt = `Create a professional cover letter based on this job posting : ${input}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return res.status(200).json({ text });
    } catch (err) {
        console.error('Error generating cover letter:', err);
        const message = err?.message || 'Failed to generate cover letter';

        if (message.includes('quota') || message.includes('429')) {
            return res.status(429).json({
                error: 'Rate limit exceeded. Please wait a minute and try again.',
            });
        }

        return res.status(500).json({ error: `Failed to generate: ${message}` });
    }
}