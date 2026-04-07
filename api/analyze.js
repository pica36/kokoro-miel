export default async function handler(req, res) {
    // POSTリクエスト以外は弾く（セキュリティ対策）
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // スマホ（表側）から送られてきた画像とテキストを受け取る
        const { promptText, base64Data, mimeType } = req.body;

        // 【重要】ここでVercelの金庫に隠したAPIキーを呼び出します
        const apiKey = process.env.GEMINI_API_KEY;

        // サーバーからGoogle (Gemini) へ安全に通信（モデル名を1.5に修正済み）
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

        const data = await googleResponse.json();
        
        // Googleからの解析結果を、スマホ（表側）に送り返す
        res.status(200).json(data);

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}