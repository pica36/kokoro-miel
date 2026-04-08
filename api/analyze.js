export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { promptText, base64Data, mimeType } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) return res.status(400).json({ error: "APIキーが設定されていません" });

        // 【修正：2026年最新の安定URL】
        // v1beta を使い、モデル名を gemini-1.5-flash-latest に変更します
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
        
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

        const data = await googleResponse.json();

        // もし Google からエラーが返ってきたら、そのままフロントに渡す
        if (data.error) {
            return res.status(googleResponse.status).json(data);
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
