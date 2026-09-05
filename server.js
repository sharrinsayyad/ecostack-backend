const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // Agar Node v18+ hai toh iski zaroorat nahi hoti, par safe side ke liye

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/optimize', async (req, res) => {
  try {
    const { code, worstCode, prompt } = req.body;
    const inputCode = code || worstCode || prompt;

    if (!inputCode) {
      return res.status(400).json({ error: "Code missing in request body" });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GEMINI_API_KEY || process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "google/gemini-2.5-flash:free",
        "messages": [
          { 
            "role": "system", 
            "content": "You are an AI code optimization engine. Return only optimized, efficient, clean code with minimal necessary inline comments." 
          },
          { 
            "role": "user", 
            "content": `Optimize this code for execution speed and lower cloud infrastructure cost:\n\n${inputCode}` 
          }
        ]
      })
    });

    const data = await response.json();

    if (data.choices && data.choices[0] && data.choices[0].message) {
      const optimizedCode = data.choices[0].message.content;
      return res.json({ optimizedCode });
    } else {
      return res.status(500).json({ error: "OpenRouter API Error", details: data });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
