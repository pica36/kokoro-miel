export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { promptText, base64Data, mimeType } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) return res.status(400).json({ error: "APIキーが設定されていません" });

        // 【ステップ1】Googleに「今このキーで使えるモデルを全部教えろ」と要求する
        const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const listRes = await fetch(listUrl);
        const listData = await listRes.json();

        if (listData.error) {
            return res.status(400).json({ error: "APIキーエラー: " + listData.error.message });
        }

        // 【ステップ2】返ってきたリストの中から、画像解析(generateContent)ができるモデルを自動で選ぶ
        const models = listData.models || [];
        // まず「flash」と名のつくものを探し、なければ使えるものを手当たり次第に選ぶ
        let targetModel = models.find(m => m.supportedGenerationMethods?.includes("generateContent") && m.name.includes("flash"))?.name;
        if (!targetModel) {
            targetModel = models.find(m => m.supportedGenerationMethods?.includes("generateContent"))?.name;
        }

        // もし使えるモデルが一つもなかったら、Googleが隠し持っているモデル名を全部画面に出す
        if (!targetModel) {
            const allNames = models.map(m => m.name).join(", ");
            return res.status(400).json({ error: "使えるモデルがありません。Googleからの全リスト: " + allNames });
        }

        // 【ステップ3】自動で見つけた「本物の名前(targetModel)」を使って解析を実行する
        const url = `https://generativelanguage.googleapis.com/v1beta/${targetModel}:generateContent?key=${apiKey}`;
        
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
        
        if (data.error) {
            return res.status(googleResponse.status).json(data);
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "サーバーエラー: " + error.message });
    }
}
