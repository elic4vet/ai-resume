const generateContent = async () => {
    setError('');
    setOutput('');

    if (!input.trim()) {
        setError('Please enter some information');
        return;
    }

    setLoading(true);

    try {
        const res = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'letter', input }),
        });

        const rawText = await res.text();
        let data = null;

        try {
            data = JSON.parse(rawText);
        } catch {
            if (res.status === 504) {
                throw new Error('The request timed out. Try shortening your input or retrying.');
            }
            throw new Error(`Server error (${res.status}). Please try again in a moment.`);
        }

        if (!res.ok) {
            throw new Error(data?.error || `Request failed (${res.status})`);
        }

        setOutput(data.text);
    } catch (err) {
        console.error('Error details:', err);
        setError(err?.message || 'Unknown error occurred');
    } finally {
        setLoading(false);
    }
};