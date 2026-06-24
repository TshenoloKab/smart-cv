import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

/**
 * ✅ CORS FIX (production safe)
 */
const corsOptions = {
  origin: "https://smart-cv-ashen.vercel.app",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// MUST be first middleware
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());

/**
 * Gemini AI setup
 */
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * MAIN ROUTE: Analyze CV
 */
app.post("/analyze", async (req, res) => {
  try {
    const { resume } = req.body;

    if (!resume) {
      return res.status(400).json({
        error: "No resume provided",
      });
    }

    const prompt = `
You are a professional senior recruiter.

Analyze the resume below.

Return ONLY valid JSON.

{
  "score": 0,
  "strengths": [],
  "weaknesses": [],
  "improvedCV": ""
}

Resume:

${resume}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text.trim();

    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error("JSON parse failed:", cleaned);
      return res.status(500).json({
        error: "AI returned invalid JSON",
      });
    }

    res.json(parsed);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
});

/**
 * Health check route (useful for Railway)
 */
app.get("/", (req, res) => {
  res.send("SmartCV API is running 🚀");
});

/**
 * Start server
 */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});