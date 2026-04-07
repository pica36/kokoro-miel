export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { promptText, base64Data, mimeType } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
        
        const googleResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ 
                    parts: [
                        { text: promptText }, 
                        // 【修正】アンダーバーを消し、正しい大文字小文字に修正しました
                        { inlineData: { mimeType: mimeType, data: base64Data } }
                    ] 
                }]
            })
        });

        // 【修正】Googleからの本当のエラーを画面に返すようにしました
        if (!googleResponse.ok) {
            const errorData = await googleResponse.json().catch(() => null);
            const errorMessage = errorData?.error?.message || await googleResponse.text();
            console.error("Geminiエラー詳細:", errorMessage);
            return res.status(400).json({ error: errorMessage });
        }

        const data = await googleResponse.json();

        if (!data.candidates) {
            return res.status(400).json({ error: "AI response invalid" });
        }

        res.status(200).json(data);

    } catch (error) {
        console.error("サーバーエラー詳細:", error);
        res.status(500).json({ error: error.message });
    }
}
