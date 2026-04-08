console.log("🔥 新しいanalyze.js動いてます");
export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { promptText, base64Data, mimeType } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) return res.status(400).json({ error: "APIキーが設定されていません" });

        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        
        const googleResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ 
                    parts: [
                        { text: promptText }, 
                        { inlineData: { mimeType: mimeType, data: base64Data } }
                    ] 
                }]
            })
        });

        const data = await googleResponse.json();

        if (!googleResponse.ok) {
            const msg = data.error?.message || "Google APIエラー";
            return res.status(googleResponse.status).json({ error: `[API接続失敗] ${msg}` });
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "サーバー内部エラー: " + error.message });
    }
}
