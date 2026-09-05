const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Environment Variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL || "https://qrigszyiyqyflbotsjgt.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_KEY || "sb_publishable_Iikfkn_k6VyczNX_X_3S4Q_e8tS8JwL";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Real Gemini AI Code Optimization Proxy Endpoint
app.post('/api/optimize', async (req, res) => {
  try {
    const { userCode } = req.body;
    if (!userCode) return res.status(400).json({ error: "Code is required" });

    // Updated to Gemini 2.5 Flash Model Endpoint
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "You are an expert cloud infrastructure and AWS code optimizer. Optimize the following code to make it highly efficient. Return ONLY the optimized code without any markdown block formatting or conversational text:\n\n" + userCode
          }]
        }]
      })
    });

    const data = await response.json();

    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
      const cleanCode = data.candidates[0].content.parts[0].text;
      return res.json({ optimizedCode: cleanCode });
    } else {
      // Returns exact error message from Gemini API if something fails
      const errorMessage = data.error?.message || "Gemini AI processing failed. Please verify API Key in Render environment variables.";
      return res.status(500).json({ error: errorMessage });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.send("⚡ EcoStack AI Production Backend Engine is LIVE!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
