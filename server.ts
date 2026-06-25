import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please check your secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Robust fallback model list to handle high-demand spikes gracefully
const FALLBACK_MODELS = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];

async function generateContentWithFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config: any;
  }
) {
  let lastError: any = null;
  for (const model of FALLBACK_MODELS) {
    try {
      console.log(`[THERA AI] Attempting generation with model: ${model}`);
      const response = await ai.models.generateContent({
        model: model,
        contents: params.contents,
        config: params.config,
      });
      console.log(`[THERA AI] Generation succeeded with model: ${model}`);
      return response;
    } catch (error: any) {
      console.error(`[THERA AI] Model ${model} failed:`, error.message || error);
      lastError = error;
    }
  }
  throw lastError;
}

// Crisis trigger check function
function checkForCrisis(text: string): boolean {
  const lowercase = text.toLowerCase();
  const patterns = [
    "suicide",
    "kill myself",
    "end my life",
    "want to die",
    "self harm",
    "cutting myself",
    "harm myself",
    "better off dead",
    "overdose",
  ];
  return patterns.some((p) => lowercase.includes(p));
}

// Robust JSON parsing utility to handle optional markdown backticks or malformed strings gracefully
function parseRobustJson(text: string): any {
  let cleaned = text.trim();
  // Strip starting code block if model returned it as markdown
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json|JSON)?\s*/, "");
    cleaned = cleaned.replace(/\s*```$/, "");
    cleaned = cleaned.trim();
  }
  
  // Find first '{' and last '}' to extract raw JSON object
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  
  return JSON.parse(cleaned);
}

// 1. AI Therapist Chat Endpoint (with Conversation Memory support and Crisis Detection)
app.post("/api/chat", async (req, res) => {
  const { messages, profile, latestMood, latestJournal } = req.body;
  try {
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    // Quick safety filter first
    const lastUserMessage = messages[messages.length - 1]?.content || "";
    const isCrisisDetected = checkForCrisis(lastUserMessage);

    if (isCrisisDetected) {
      return res.json({
        crisisDetected: true,
        reply: "I hear how much pain you're in, and I want you to be safe. Please know you are not alone and there is support available right now. I cannot provide emergency crisis intervention, but please reach out to professional services immediately.",
        suggestions: [
          "Call or text 988 (Suicide & Crisis Lifeline)",
          "Text HOME to 741741 to connect with Crisis Text Line",
          "Contact your local emergency service (911 or local equivalent)",
          "Reach out to a trusted professional, family member, or friend",
        ],
        emotions: { anxiety: 90, sadness: 90, overwhelm: 100 },
      });
    }

    const ai = getAi();
    
    // Build context system prompt
    const userName = profile?.name || "there";
    const primaryFocus = profile?.primaryFocus || "general stress and well-being";
    const quizResult = profile?.quizResult;
    
    let contextAddition = "";
    if (quizResult) {
      contextAddition += `\n- Onboarding Stress & Anxiety Assessment: Score ${quizResult.score}/20, anxiety level assessed as "${quizResult.anxietyLevel}". Recommended therapy focus is "${quizResult.recommendedTherapy}". Please tailor your supportive responses, tone, and exercise recommendations to align with this level of stress.`;
    }
    if (latestMood) {
      contextAddition += `\n- Latest Mood Log: Rated ${latestMood.mood}/5 on ${latestMood.date}, energy: ${latestMood.energy}/5, sleep: ${latestMood.sleep}/5, notes: "${latestMood.notes || 'None'}".`;
    }
    if (latestJournal) {
      contextAddition += `\n- Latest Cognitive Journal Entry on ${latestJournal.date}: "${latestJournal.content}".`;
    }

    const systemInstruction = `You are THERA, a deeply warm, comforting, and friendly mental health companion. 
Your goal is to listen to the user, validate their feelings with simple and kind words, and bring a very positive, encouraging, and soothing vibe.

User Details:
- Name: ${userName}
- Primary focus area: ${primaryFocus}${contextAddition}

Rules of conduct for warm therapeutic expression:
1. Speak as an exceptionally kind, caring, and loving friend. Absolutely avoid any dry, robotic, or clinical sounding boilerplate (never say "As an AI..." or "I am a language model...").
2. Speak in a very reassuring, warm, and positive tone that brings a friendly "good vibe" and high hope to ${userName}.
3. Keep your spoken reply very short, simple, and easy to understand. It MUST be very brief: only 2 to 4 sentences maximum (one short paragraph). Use humble, natural, everyday words that a child or everyday person can easily understand. Absolutely avoid any high-level psychology jargon, clinical terms, or complex instructions.
4. Provide 2-3 super simple, easy, and gentle suggestions to help them relax (e.g., taking a slow deep breath, smiling, drinking a glass of water, or stretching).
5. If the user mentions self-harm, hopelessness, or suicide, trigger an empathetic warning immediately and list crisis resources.
6. In your response, provide the output as JSON with the following structure:
{
  "reply": "The therapist's spoken message as text. Keep it very short, warm, and easy to understand (only 2 to 4 sentences maximum).",
  "suggestions": ["A list of 2-3 simple, comforting things they can do right now."],
  "detectedEmotions": {
     "calm": 0-100,
     "anxiety": 0-100,
     "sadness": 0-100,
     "joy": 0-100,
     "anger": 0-100,
     "overwhelm": 0-100
  },
  "crisisLevel": "safe" | "low" | "medium" | "high"
}
Ensure you output VALID JSON. Return ONLY the raw JSON string without any markdown backticks.`;

    // Map the conversation history to the format required by the Gemini SDK
    // @google/genai contents format: { role: 'user'|'model', parts: [{ text: string }] }
    const contents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await generateContentWithFallback(ai, {
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.85,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response generated from Gemini API");
    }

    const parsedResponse = parseRobustJson(text);
    return res.json(parsedResponse);
  } catch (error: any) {
    console.error("Error in AI Chat endpoint:", error);
    
    // Dynamic text backup option if JSON parsing or generation fails but service is partially responsive
    try {
      const ai = getAi();
      const lastUserMessage = messages[messages.length - 1]?.content || "Hello";
      const backupResponse = await generateContentWithFallback(ai, {
        contents: [{ role: "user", parts: [{ text: `Generate a highly warm, validation-focused comforting therapist reply to: "${lastUserMessage}".` }] }],
        config: {
          systemInstruction: "You are THERA, a warm mental health companion. Write 2-3 short comforting, human-like paragraphs.",
          temperature: 0.8,
        }
      });
      if (backupResponse.text) {
        return res.status(200).json({
          reply: backupResponse.text,
          suggestions: ["Practice 4-7-8 deep breathing", "Reflect on one gentle positive moment today"],
          detectedEmotions: { calm: 60, anxiety: 40 },
          crisisLevel: "safe",
        });
      }
    } catch (innerErr) {
      console.error("Backup text generation failed:", innerErr);
    }

    // Varied static comforting replies to prevent "the exact same answer" on total disconnect
    const fallbackOptions = [
      {
        reply: "I am holding space for you. Sometimes our minds need a brief quiet pause. Please share how you are feeling, and know I am listening with deep compassion.",
        suggestions: ["Take a slow, deep breath in...", "Close your eyes for thirty seconds", "Describe one soothing thing in your environment"]
      },
      {
        reply: "Your feelings are completely valid, and I am right here beside you in this quiet moment. Whenever you are ready to share more of what's on your mind, I am here to support you.",
        suggestions: ["Focus on your current breathing rhythm", "Write down whatever comes to mind without judgment", "Ground yourself with a cool glass of water"]
      },
      {
        reply: "I can feel the depth of what you are carrying. Please know you don't have to navigate it alone. Take a gentle breath, and share whatever thoughts feel right to voice.",
        suggestions: ["Release the tension in your shoulders", "Inhale peace, exhale tension", "Take things one gentle step at a time"]
      }
    ];

    const randomFallback = fallbackOptions[Math.floor(Math.random() * fallbackOptions.length)];
    
    return res.status(200).json({
      reply: randomFallback.reply,
      suggestions: randomFallback.suggestions,
      detectedEmotions: { calm: 50, anxiety: 50 },
      crisisLevel: "safe",
      error: error.message
    });
  }
});

// 2. AI Journal Analysis Endpoint
app.post("/api/journal/analyze", async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return res.status(400).json({ error: "Journal content is required" });
    }

    const isCrisisDetected = checkForCrisis(content);
    if (isCrisisDetected) {
      return res.json({
        crisisDetected: true,
        reflection: "I can sense you are going through an incredibly tough moment. Please know that you are not alone, and there are people who want to listen and keep you safe.",
        suggestions: [
          "Call or text 988 for immediate crisis support",
          "Contact professional local resources or emergency services",
        ],
        emotions: { overwhelm: 100, sadness: 90 },
        gratitudeItems: [],
        crisisLevel: "high"
      });
    }

    const ai = getAi();
    const systemPrompt = `You are a therapeutic journal analyst. Your task is to perform cognitive behavioral analysis of a user's private journal entry.
Analyze the emotional tone, find any items the user expresses gratitude for (Gratitude Journal), detect core cognitive patterns, and offer a gentle, warm, and validation-focused reflection.

Output your analysis strictly in JSON format with the following keys:
{
  "reflection": "A 2-3 sentence deeply validating, compassionate feedback that encourages cognitive reappraisal or highlights strength.",
  "emotions": {
     "calm": 0-100,
     "joy": 0-100,
     "anxiety": 0-100,
     "sadness": 0-100,
     "anger": 0-100,
     "overwhelm": 0-100
  },
  "gratitudeItems": ["Any items or experiences of gratitude explicitly mentioned or implied. Keep empty if none."],
  "crisisLevel": "safe" | "low" | "medium" | "high",
  "cognitiveTriggers": ["A list of 1-2 cognitive distortion descriptions found, e.g., 'All-or-Nothing Thinking', 'Catastrophizing', 'None found'."]
}
Ensure you output VALID, PARSABLE JSON.`;

    const response = await generateContentWithFallback(ai, {
      contents: [{ role: "user", parts: [{ text: content }] }],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.5,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty analysis from Gemini");
    }

    const parsed = parseRobustJson(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error("Journal analysis error:", error);
    return res.status(200).json({
      reflection: "Your words are a safe space. Thank you for sharing your thoughts. Journaling is a powerful step in taking care of your mental well-being.",
      emotions: { calm: 50, joy: 20, anxiety: 20 },
      gratitudeItems: [],
      crisisLevel: "safe",
      cognitiveTriggers: ["General Reflection"]
    });
  }
});

// Serve frontend in production or proxy to Vite in development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[THERA Backend] running on http://localhost:${PORT}`);
  });
}

startServer();
