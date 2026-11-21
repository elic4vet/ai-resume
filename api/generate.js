import { GoogleGenerativeAI } from '@google/generative-ai';

import { GoogleGenerativeAI } from '@google/generative-ai';

const MODELS = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.5-flash-lite'];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateWithFallback(genAI, prompt) {
    let lastError;

    for (const modelName of MODELS) {
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                return response.text();
            } catch (err) {
                lastError = err;
                const message = err?.message || '';
                const isOverloaded =
                    message.includes('503') ||
                    message.includes('Service Unavailable') ||
                    message.includes('overloaded');

                if (!isOverloaded) {
                    throw err; // Don't retry auth or invalid request errors
                }

                // Wait briefly before retrying or trying the next fallback model
                await sleep(800 * (attempt + 1));
            }
        }
    }

    throw lastError;
}


export default async function handler(req, res) {
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

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-flash-latest',
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return res.status(200).json({ text });
    } catch (err) {
        console.error('Error generating content:', err);
        const message = err?.message || 'Failed to generate content';

        if (message.includes('quota') || message.includes('429')) {
            return res.status(429).json({
                error: 'Rate limit exceeded. Please wait a minute and try again.',
            });
        }

        return res.status(500).json({ error: `Failed to generate: ${message}` });
    }
}