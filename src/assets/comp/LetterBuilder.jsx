import { useState } from 'react';

const LetterBuilder = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const generateContent = async () => {
        setError('');
        setOutput('');

        if (!input.trim()) {
            setError('Please enter some information');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/generate-letter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input: input.trim() }),
            });

            let data;
            try {
                data = await res.json();
            } catch {
                data = {};
            }

            if (!res.ok) {
                throw new Error(data.error || 'Failed to generate');
            }

            if (!data.text) {
                throw new Error('No cover letter was returned');
            }

            setOutput(data.text);
        } catch (err) {
            console.error('Error details:', err);
            const message = err?.message || 'Unknown error occurred';

            if (message.includes('quota') || message.includes('429')) {
                setError('Rate limit exceeded. Please wait a minute and try again.');
            } else {
                setError(`Failed to generate: ${message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl mt-6 p-6 border border-gray-700/50 shadow-xl h-full">
            <div className="flex flex-col h-full gap-6">
                {/* Header */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-white mb-2">Cover Letter Builder</h2>
                    <p className="text-gray-400 text-sm">AI-powered professional cover letters</p>
                </div>

                {/* Input Section */}
                <div className="flex flex-col gap-3">
                    <label className="text-white font-medium text-sm">Job Posting Details</label>
                    <textarea
                        className="w-full h-48 p-4 bg-gray-900/50 text-white rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all resize-none placeholder-gray-500 text-sm"
                        placeholder="Paste the job posting or describe the position you're applying for..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                </div>

                {/* Generate Button */}
                <button
                    className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all duration-300 px-6 py-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-rose-500/30 transform hover:scale-[1.02] active:scale-[0.98]"
                    onClick={generateContent}
                    disabled={loading}
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating...
                        </span>
                    ) : (
                        'Generate Cover Letter'
                    )}
                </button>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-3">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {/* Output Section */}
                {output && (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-300 flex-1 flex flex-col">
                        <div className="bg-gradient-to-r from-rose-500 to-pink-600 px-4 py-3">
                            <h3 className="text-lg font-semibold text-white">Your Cover Letter</h3>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="space-y-3 leading-relaxed text-gray-800 font-serif">
                                {output.split('\n\n').map((paragraph, index) => (
                                    <p key={index} className="text-justify text-sm">{paragraph}</p>
                                ))}
                            </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex gap-2">
                            <button
                                className="flex-1 bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-all font-medium text-sm shadow-sm hover:shadow-md"
                                onClick={() => {
                                    const blob = new Blob([output], { type: 'text/plain' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = 'cover-letter.txt';
                                    document.body.appendChild(a);
                                    a.click();
                                    a.remove();
                                    URL.revokeObjectURL(url);
                                }}
                            >
                                Download
                            </button>
                            <button
                                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-all font-medium text-sm shadow-sm hover:shadow-md"
                                onClick={() => window.print()}
                            >
                                Print
                            </button>
                            <button
                                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all font-medium text-sm shadow-sm hover:shadow-md"
                                onClick={() => setOutput('')}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LetterBuilder;