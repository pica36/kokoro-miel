export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { promptText, base64Data, mimeType } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const googleResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ 
                    parts: [
                        { text: promptText }, 
                        { inline_data: { mime_type: mimeType, data: base64Data } }
                    ] 
                }]
            })
        });

        if (!googleResponse.ok) {
            const errorText = await googleResponse.text();
            console.error("Geminiエラー:", errorText);
            return res.status(200).json({ error: errorText });
        }

        const data = await googleResponse.json();

        if (!data.candidates) {
            return res.status(200).json({ error: "AI response invalid" });
        }

        res.status(200).json(data);

    } catch (error) {
        console.error("サーバーエラー詳細:", error);
        res.status(200).json({ error: error.message });
    }
}
