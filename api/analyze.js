export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { promptText, base64Data, mimeType } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        // 成功実績のある v1beta と、高速な 1.5-flash を使用
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const googleResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ 
                    parts: [
                        { text: promptText }, 
                        // inline_data と mime_type (アンダーバー) が正解です
                        { inline_data: { mime_type: mimeType, data: base64Data } }
                    ] 
                }]
            })
        });

        const data = await googleResponse.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
