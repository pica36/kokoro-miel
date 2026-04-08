export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { promptText, base64Data, mimeType } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) return res.status(400).json({ error: "APIキーが設定されていません" });

        // 【2026年標準】窓口は v1beta、モデルは gemini-3-flash
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash:generateContent?key=${apiKey}`;
        
        const googleResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ 
                    parts: [
                        { text: promptText }, 
                        // inline_data (アンダーバー) が必須
                        { inline_data: { mime_type: mimeType, data: base64Data } }
                    ] 
                }]
            })
        });

        const data = await googleResponse.json();
        
        // Googleからのエラーがあればそのまま返す
        if (data.error) {
            return res.status(googleResponse.status || 500).json(data);
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
