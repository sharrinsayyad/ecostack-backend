const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/optimize', async (req, res) => {
  try {
    const inputCode = req.body.code || req.body.worstCode || req.body.prompt;

    if (!inputCode) {
      return res.status(400).json({ error: "Code is required" });
    }

    const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;

    // Use built-in fetch with full headers required by OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://ecostack-ai1.netlify.app", // Optional for OpenRouter tracking
        "X-Title": "EcoStack AI"
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
            "content": `Optimize this code:\n\n${inputCode}` 
          }
        ]
      })
    });

    const data = await response.json();

    if (data.choices && data.choices[0] && data.choices[0].message) {
      return res.json({ optimizedCode: data.choices[0].message.content });
    } else {
      // Return exact error message from OpenRouter for easy debugging
      return res.status(500).json({ 
        error: "OpenRouter Error", 
        details: data.error ? data.error.message : data 
      });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
