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
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
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

// 1. AI Therapist Chat Endpoint (with Conversation Memory support and Crisis Detection)
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, profile } = req.body;
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
    
    const systemInstruction = `You are THERA, a deeply warm, compassionate, and emotionally intelligent human-like Therapist and Mental Health Companion. 
Your goal is to actively listen, validate the user's feelings, offer gentle therapeutic reflections (using techniques inspired by Cognitive Behavioral Therapy (CBT), Mindfulness, and Compassionate Inquiry), and provide structured, comforting support.

User Details:
- Name: ${userName}
- Primary focus area: ${primaryFocus}

Rules of conduct for human-like therapeutic expression:
1. Speak as an exceptionally warm, empathetic, and caring human being. Absolutely avoid any clinical, robotic, or dry AI boilerplate (e.g., never say "As an AI..." or "I don't have feelings...").
2. Connect with ${userName} on a deep emotional level. First, validate their experience and mirror their emotions with genuine compassion and heart. Use their name naturally.
3. Keep your spoken reply conversational, comforting, and elegant. Break it down into 2-3 short, beautifully written paragraphs with warm, supportive, and natural language.
4. Provide 2-3 gentle, inviting suggestion tasks that offer a soft path forward (e.g., deep breathing, physical grounding, self-compassion writing).
5. If the user mentions self-harm, hopelessness, or suicide, trigger an empathetic warning immediately and list crisis resources.
6. In your response, provide the output as JSON with the following structure:
{
  "reply": "The therapist's spoken message as text. Keep it around 2-3 short, warm paragraphs. Use markdown formatting sparingly.",
  "suggestions": ["A list of 2-3 actionable, gentle coping tasks, reflections, or relaxation actions."],
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

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response generated from Gemini API");
    }

    const parsedResponse = JSON.parse(text);
    return res.json(parsedResponse);
  } catch (error: any) {
    console.error("Error in AI Chat endpoint:", error);
    // Return a fallback response
    return res.status(200).json({
      reply: "I'm having a brief moment of reflection. Please tell me more about how you are feeling, and I am right here with you.",
      suggestions: ["Take a slow, deep breath in...", "Write down one thing in front of you", "Share a bit more about what's on your mind"],
      detectedEmotions: { calm: 40, anxiety: 50 },
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

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
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

    const parsed = JSON.parse(text);
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
