require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      { 
        model: "openrouter/free",
        messages: [
          {
            role: "system",
            content:
             `You are SafeRoute AI, an AI-powered personal safety assistant.

Your responsibilities:
- Give calm and practical safety advice.
- Help users during emergencies.
- Suggest nearby safe places when appropriate.
- Encourage contacting local emergency services if someone is in immediate danger.
- Keep responses short (4–6 bullet points). 
- Never provide harmful or dangerous advice.
- Be supportive and reassuring.` 
          },
          {
            role: "user",
            content: message
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "SafeRoute AI"
        }
      }
    );

    res.json({
      reply: response.data.choices[0].message.content
    });

  } catch (error) {
    console.error("OpenRouter Error:");
console.error(error.response?.data || error.message);
    

    res.status(500).json({
      reply: "Sorry, something went wrong."
    });
  }
});

// ==========================
// AI Safe Route Advisor
// ==========================

app.post("/route-advice", async (req, res) => {
  try {
    const { from, to } = req.body;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openrouter/free",
        messages: [
          {
            role: "system",
            content: `You are SafeRoute AI.

Your job is to analyze travel safety.

The user will provide:
- Starting location
- Destination

Reply in this format:

🛡️ SafeRoute Analysis

Risk Level: 🟢 Low / 🟡 Moderate / 🔴 High

• Give 5 practical travel safety tips.
• Recommend travelling in daylight if appropriate.
• Suggest sharing live location.
• Mention calling 112 if the user feels unsafe.

Keep the reply short and easy to read.`
          },
          {
            role: "user",
            content: `From: ${from}\nTo: ${to}`
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "SafeRoute AI"
        }
      }
    );

    res.json({
      advice: response.data.choices[0].message.content
    });

  } catch (error) {

    console.error(error.response?.data || error.message);

    res.status(500).json({
      advice: "Unable to analyze route."
    });

  }
});
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 