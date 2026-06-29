# 🌌 THERA — AI Therapist & Mental Health Companion

THERA is a fully-featured, deeply empathetic full-stack mental health support platform and companion. Built using a modern **React 19**, **Vite**, **Express**, **TypeScript**, **Firebase**, and **Google Gemini AI** architecture, THERA provides a secure, private, and highly supportive space for users to track their emotional well-being, seek real-time CBT-aligned counseling, analyze cognitive distortions, and practice relaxing mindfulness exercises.

---

## 🚀 Key Features

*   **🔒 Secure Google Authentication:** Integrates Firebase Authentication to provide quick, secure, and personalized user account setup.
*   **💬 Intelligent Therapist Chat (CBT-aligned):** Conversational partner powered by Google Gemini, maintaining safety guidelines, dynamic session memory, crisis-trigger checks, and real-time empathy.
*   **📓 Cognitive Journaling:** Secure digital scratchpad supporting AI-driven emotional logs, automatic cognitive distortion recognition (e.g., Catastrophizing, All-or-Nothing Thinking), and private cover masking for privacy.
*   **📊 Wellness Dashboards:** Interactive visualization charts built with Recharts, graphing mood ratings, energy levels, physical well-being, and sleep health over time.
*   **🧘 Guided Breathing Widget:** A rhythmic visual and audio meditation helper with dynamic canvas waves, timers, state control, and sound synthesizers.
*   **📝 Intake Stress Quiz:** A standard onboarding assessment that scores current anxiety levels and recommendations customized to the individual.

---

## 🛠️ System Architecture

```
                                  +-------------------+
                                  |    Client Web     |
                                  |    (React 19)     |
                                  +---------+---------+
                                            |
                         +------------------+------------------+
                         | HTTP Requests                       | Firebase Web Auth
                         v                                     v
             +-----------+-----------+               +---------+---------+
             |    Express Backend    |               |  Firebase Auth &  |
             |  (Secure API Proxy)   |               | Firestore DB      |
             +-----------+-----------+               +-------------------+
                         |
                         | SDK / Server-to-Server
                         v
             +-----------+-----------+
             |   Google Gemini API   |
             |  (CBT/Journal Model)  |
             +-----------------------+
```

THERA implements a **Full-Stack (Server + Client)** architecture. 

### Why Full-Stack?
1.  **Security (API Key Protection):** The Google Gemini API key must never be exposed to client-side browsers. The Express.js backend acts as a secure reverse-proxy, keeping sensitive API credentials and fine-tuned system instructions isolated.
2.  **Crisis & Sanitization Filters:** Before a user's prompt is sent to the LLM, the backend intercepts and checks for emergency/crisis triggers (e.g., severe self-harm or suicidal ideation). This guarantees immediate fallback redirection to certified national support networks (988).
3.  **Unified Production Deployment:** Express is configured to serve both API routes and static production-built frontend assets (`dist/` directory) via a single unified port, resulting in high speed and minimal container spin-up times on modern cloud hosts (like Cloud Run).

---

## 📂 Project Directory Structure

Here is a map of the codebase and the purpose of every folder/file:

```
├── .env.example                  # Template listing required environment variables (e.g., GEMINI_API_KEY)
├── .gitignore                    # Ensures build artifacts, node_modules, and secrets are never committed
├── firebase-applet-config.json   # Direct project configurations for the active Firebase deployment
├── firestore.rules               # Strict security guidelines for read/write requests on Cloud Firestore
├── index.html                    # The HTML document shell for mounting the React frontend
├── metadata.json                 # Core application configuration, description, and permission requirements
├── package.json                  # Manages dependencies, script definitions, and bundling configurations
├── server.ts                     # The full-stack Express.js server, handling proxying, API routes, and Vite HMR
├── tsconfig.json                 # Configures TypeScript compilation strictness, module resolution, and path mappings
├── vite.config.ts                # Bundling instructions for our modern Vite client engine (includes Tailwind plugin)
├── assets/                       # Static media files, logos, and global imagery assets
└── src/                          # React client application code
    ├── main.tsx                  # Standard React entry point for initializing the virtual DOM
    ├── App.tsx                   # Central router & UI layout container managing screens and user states
    ├── index.css                 # Standard global CSS sheet initiating Tailwind CSS configurations and fonts
    ├── types.ts                  # Shared Type definitions, interface layouts, and schema boundaries
    ├── lib/                      # Core external engine connectors and platform integrations
    │   ├── audio.ts              # Browser AudioContext synthesizer for guided breath sound loops
    │   ├── db.ts                 # Shared helper methods for reading and writing data safely
    │   └── firebase.ts           # Client initialization for Firebase Auth and custom Firestore instances
    └── components/               # Highly modular, isolated UI elements and application sections
        ├── AnalyticsCharts.tsx   # Visual charts graphing user wellness using Recharts
        ├── AuthScreen.tsx        # UI screens for user Sign-in, Sign-up, and Password recovery flows
        ├── BreathingWidget.tsx   # Interactive canvas-based breathing widget with speed controls
        ├── CognitiveJournal.tsx  # Dynamic list of daily cognitive logs, AI insights, and feedback
        ├── CrisisModal.tsx       # Safety alert overlay that displays resources for emergency-trigger responses
        ├── Dashboard.tsx         # The main feed displaying mood status, quick actions, and recent activities
        ├── MoodLogModal.tsx      # Multi-slider mood input sheet to log daily physical and mental wellness
        ├── ProfileSettings.tsx   # Customizable options for registered name, focus, and strict privacy mode
        ├── Sidebar.tsx           # Primary app navigation, tracking active screen states
        ├── StressQuiz.tsx        # Intake screening assessment mapping current anxiety thresholds
        └── TherapistChat.tsx     # The primary therapist chat screen with suggestions and live status tracking
```

---

## 🔍 Why We Use Everything

Every single library, framework, and tooling option in this repository was selected intentionally to provide a secure, fast, and high-performance application:

### 1. Framework & Language
*   **React 19 & TypeScript:** React provides a highly interactive declarative component rendering pipeline. TypeScript overlays complete compile-time type-safety over user-authored text files, minimizing runtime logic errors in delicate medical/support situations.

### 2. Full-Stack Server & Compilation
*   **Express.js:** The gold standard for lightweight Node.js servers. Handles middleware pipelines, JSON request parsing, static asset serving, and external API requests with minimal overhead.
*   **Vite:** Operates as a super-fast local server with lightning-quick ES module bundling and fast refresh states.
*   **`tsx` & `esbuild`:** 
    *   During development, `tsx` allows direct, zero-config execution of backend TypeScript files without separate compilation.
    *   For production builds, `esbuild` bundles the Express server, its relative paths, and its dependencies into a single, optimized, standalone CommonJS bundle (`dist/server.cjs`). This prevents any relative-import issues when running in clean container runtimes.

### 3. Database & Authentication
*   **Firebase Authentication:** Handles secure user authentication, password hashing, and token verification out of the box.
*   **Cloud Firestore:** A scalable, low-latency, real-time NoSQL database. Perfect for fast-changing states (like active journaling feeds and rapid mood logging) while supporting simple offline persistence on client platforms.

### 4. Artificial Intelligence
*   **Google Gemini SDK (`@google/genai`):** Communicates with Gemini models server-side. Leverages advanced prompt parameters (`systemInstruction`, `responseMimeType: "application/json"`) to receive clean, validated, structured outputs that the React client can map into responsive UI components directly.

### 5. Frontend & Styling
*   **Tailwind CSS (v4):** Eliminates stylesheet bloat. Simplifies responsive grids, dark/light variations, layouts, and accessibility focus-rings using lightweight utility-first class configurations.
*   **Motion (`motion/react`):** Powerhouse animation engine that creates smooth, organic easing and visual physics. Essential for calming animations in breathing helpers and page transitions.
*   **Lucide React:** A consistent, clean, vector-based icon set representing actions, categories, and settings seamlessly.
*   **Recharts:** A composable, declarative React chart engine mapping key wellness metrics to beautiful SVG canvas diagrams.

---

## 💻 Local Development Setup Guide

Follow these simple steps to host, test, and run THERA locally on your machine:

### Prerequisites
Make sure you have **Node.js** (v18.x or newer) and **npm** installed on your operating system.

### Step 1: Install Project Dependencies
In your local terminal, navigate to the project directory root and run:
```bash
npm install
```

### Step 2: Configure Local Environment Variables
Create a `.env` file at the root of the project. You can copy the contents of `.env.example`:
```bash
cp .env.example .env
```
Open the `.env` file and insert your API credentials:
```env
# Secure secret key generated from Google AI Studio
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"

# Self-referential URL for your app service (optional for local running, defaults to localhost)
APP_URL="http://localhost:3000"
```

### Step 3: Launch the Unified Development Server
To boot both the Express server API and Vite dev proxy simultaneously:
```bash
npm run dev
```
Once initialized, open your browser and navigate to:
**`http://localhost:3000`**

---

## 📦 Production Bundling & Deployment

When you are ready to prepare THERA for production deployment (such as to Google Cloud Run, Vercel, or custom VPS hosts), run the following production build scripts:

### Step 1: Compile and Bundle Client and Server
```bash
npm run build
```
This single unified command will:
1.  Compile and build the Vite React client into optimized, production-ready HTML, CSS, and JS chunks inside `/dist`.
2.  Use `esbuild` to compile `server.ts` into a standalone, ultra-lean CommonJS server bundle file at `/dist/server.cjs`.

### Step 2: Start the Production Server
```bash
npm run start
```
This commands boots the highly efficient, bundled node server directly. The compiled server serves the backend endpoints and handles serving your optimized client files.

---

## 🔒 Security & Privacy Notice
THERA is a supportive helper tool designed for emotional journaling and stress management. It is **not** a medical device, nor does it provide licensed medical counseling. 

User data is secured using standard **Firebase Security Rules** (defined in `firestore.rules`), restricting individual document reads and writes solely to authenticated authors, and preventing any cross-user data visibility.
