export default async function handler(req, res) {
  console.log("🟢 analyze called");
  console.log("METHOD:", req.method);
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    console.log("REQ BODY KEYS:", Object.keys(req.body || {}));
    console.log("REQ BODY SAMPLE:", {
      promptText: req.body?.promptText?.slice?.(0,200),
      mimeType: req.body?.mimeType
    });

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
      console.error("Google API error:", data);
      return res.status(googleResponse.status).json({ error: `API接続失敗 ${data.error?.message || JSON.stringify(data)}` });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "サーバー内部エラー: " + error.message });
  }
}
