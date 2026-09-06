const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/optimize', async (req, res) => {
  try {
    const inputCode = req.body.code || req.body.worstCode;

    if (!inputCode) {
      return res.status(400).json({ error: "Code is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "API Key missing" });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "google/gemini-flash-1.5",
        "messages": [
          { "role": "system", "content": "You are an AI code optimization engine. Return only clean, optimized code." },
          { "role": "user", "content": `Optimize this code:\n\n${inputCode}` }
        ]
      })
    });

    const data = await response.json();

    if (data.choices && data.choices[0] && data.choices[0].message) {
      return res.json({ optimizedCode: data.choices[0].message.content });
    } else {
      return res.status(400).json({ openRouterError: data });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
