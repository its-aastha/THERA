import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "./lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import { Wind, X, Bell } from "lucide-react";
import { 
  getProfile, 
  saveProfile, 
  getMoodLogs, 
  saveMoodLog, 
  getJournalEntries, 
  saveJournalEntry, 
  deleteJournalEntry, 
  getGratitudeItems, 
  saveGratitudeItem, 
  getChatHistory, 
  saveChatHistory 
} from "./lib/db";
import { UserProfile, MoodLog, JournalEntry, ChatMessage, GratitudeItem, JournalAnalysis } from "./types";

// Import Custom Modular Components
import Sidebar from "./components/Sidebar";
import CrisisModal from "./components/CrisisModal";
import MoodLogModal from "./components/MoodLogModal";
import AuthScreen from "./components/AuthScreen";
import Dashboard from "./components/Dashboard";
import TherapistChat from "./components/TherapistChat";
import CognitiveJournal from "./components/CognitiveJournal";
import ProfileSettings from "./components/ProfileSettings";
import BreathingWidget from "./components/BreathingWidget";
import StressQuiz from "./components/StressQuiz";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [gratitudeItems, setGratitudeItems] = useState<GratitudeItem[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  // App navigation state
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [loading, setLoading] = useState(true);

  // Modals / Overlays triggers
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isCrisisOpen, setIsCrisisOpen] = useState(false);

  // Endpoint loading states
  const [isGeneratingChat, setIsGeneratingChat] = useState(false);
  const [isAnalyzingJournal, setIsAnalyzingJournal] = useState(false);
  const [latestJournalAnalysis, setLatestJournalAnalysis] = useState<JournalAnalysis | null>(null);

  // Reminder states
  const [showBreathingReminder, setShowBreathingReminder] = useState(false);

  // 1. Listen for Firebase Auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Load secure user specific datasets
        const isAnonymous = currentUser.isAnonymous;
        const activeEmail = currentUser.email || (isAnonymous ? "guest@thera.co" : `${currentUser.uid.substring(0,8)}@thera.co`);
        const userProfile = await getProfile(currentUser.uid, activeEmail);
        
        if (isAnonymous && (userProfile.name === "Friend" || !userProfile.name)) {
          userProfile.name = "Guest Mindful Traveler";
        }
        setProfile(userProfile);

        const moods = await getMoodLogs(currentUser.uid);
        setMoodLogs(moods);

        const loadedJournals = await getJournalEntries(currentUser.uid);
        setJournals(loadedJournals);

        const gratitude = await getGratitudeItems(currentUser.uid);
        setGratitudeItems(gratitude);

        const chat = await getChatHistory(currentUser.uid);
        setChatMessages(chat);
      } else {
        setUser(null);
        setProfile(null);
        setMoodLogs([]);
        setJournals([]);
        setGratitudeItems([]);
        setChatMessages([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Theme synchronization effect
  useEffect(() => {
    if (profile?.theme) {
      document.documentElement.setAttribute("data-theme", profile.theme);
    } else {
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, [profile?.theme]);

  // Local notification check for breathing exercise
  useEffect(() => {
    if (!profile || !profile.notificationsEnabled || !profile.reminderTime) return;

    let lastCheckedMinute = "";

    const checkTime = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, "0");
      const currentMinutes = String(now.getMinutes()).padStart(2, "0");
      const currentTimeString = `${currentHours}:${currentMinutes}`;

      if (currentTimeString === profile.reminderTime && lastCheckedMinute !== currentTimeString) {
        lastCheckedMinute = currentTimeString;
        
        // Trigger breathing reminder
        setShowBreathingReminder(true);

        // Try native browser notification
        if ("Notification" in window) {
          if (Notification.permission === "granted") {
            try {
              new Notification("Time for a Breathing Break 🌸", {
                body: "Take a peaceful minute for yourself. Start your quick breathing exercise.",
                icon: "/favicon.ico"
              });
            } catch (e) {
              console.warn("Could not fire native notification", e);
            }
          }
        }
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 15000); // Check every 15s to be precise

    return () => clearInterval(interval);
  }, [profile?.reminderTime, profile?.notificationsEnabled]);

  // Handle custom test triggers from Profile Settings or elsewhere
  useEffect(() => {
    const handleTestTrigger = () => {
      setShowBreathingReminder(true);
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          try {
            new Notification("Time for a Breathing Break 🌸", {
              body: "Take a peaceful minute for yourself. Start your quick breathing exercise.",
              icon: "/favicon.ico"
            });
          } catch (e) {
            console.warn("Could not fire native notification", e);
          }
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
              try {
                new Notification("Time for a Breathing Break 🌸", {
                  body: "Take a peaceful minute for yourself. Start your quick breathing exercise.",
                  icon: "/favicon.ico"
                });
              } catch (e) {
                console.warn("Could not fire native notification", e);
              }
            }
          });
        }
      }
    };

    window.addEventListener("trigger-breathing-reminder", handleTestTrigger);
    return () => window.removeEventListener("trigger-breathing-reminder", handleTestTrigger);
  }, []);

  // 2. Log out controller
  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign out failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // 3. Daily check-in logger save callback
  const handleSaveCheckIn = async (newLog: Omit<MoodLog, "id" | "userId">) => {
    if (!user) return;
    const logged = await saveMoodLog(user.uid, newLog);
    setMoodLogs((prev) => [logged, ...prev.filter((l) => l.date !== logged.date)]);
  };

  // 4. Send chat message callback (Cognitive Memory + Crisis Auto-trigger)
  const handleSendChatMessage = async (text: string) => {
    if (!user || !profile) return;

    // Append raw user message locally
    const userMsg: ChatMessage = {
      id: `chat_${Date.now()}_u`,
      userId: user.uid,
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    const updatedHistory = [...chatMessages, userMsg];
    setChatMessages(updatedHistory);
    await saveChatHistory(user.uid, updatedHistory);

    setIsGeneratingChat(true);

    try {
      // Post full recent context to our secure server Express route
      // We take the last 15 messages to preserve memory without exceeding model tokens
      const requestContext = updatedHistory.slice(-15).map((m) => ({
        role: m.role,
        content: m.content
      }));

      const latestMood = moodLogs[0] || null;
      const latestJournal = journals[0] || null;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: requestContext,
          profile: {
            name: profile.name,
            primaryFocus: profile.primaryFocus,
            quizResult: profile.quizResult
          },
          latestMood,
          latestJournal
        })
      });

      if (!res.ok) {
        throw new Error("Therapist route error");
      }

      const responseData = await res.json();

      // If sever crisis trigger detected, pop crisis support hotline modal immediately!
      if (responseData.crisisDetected) {
        setIsCrisisOpen(true);
      }

      const aiMsg: ChatMessage = {
        id: `chat_${Date.now()}_ai`,
        userId: user.uid,
        role: "assistant",
        content: responseData.reply,
        timestamp: Date.now(),
        detectedEmotions: responseData.detectedEmotions,
        suggestions: responseData.suggestions,
        crisisDetected: responseData.crisisDetected || false
      };

      const finalHistory = [...updatedHistory, aiMsg];
      setChatMessages(finalHistory);
      await saveChatHistory(user.uid, finalHistory);

    } catch (err) {
      console.error("Express Chat transmission error:", err);
      // Fallback model support
      const fallbackMsg: ChatMessage = {
        id: `chat_${Date.now()}_ai`,
        userId: user.uid,
        role: "assistant",
        content: "I am holding a silent reflection with you. I may have disconnected from the THERA cloud briefly, but please know I am right here listening. Please continue typing whenever you are ready.",
        timestamp: Date.now(),
        suggestions: ["Grounding exercise", "Take a deep breath"],
      };
      setChatMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsGeneratingChat(false);
    }
  };

  // 5. Save Cognitive Journal log callback (analyzes text, auto extracts gratitude)
  const handleSaveJournalEntry = async (journalContent: string) => {
    if (!user) return;
    setIsAnalyzingJournal(true);

    try {
      const res = await fetch("/api/journal/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: journalContent })
      });

      if (!res.ok) throw new Error("CBT analyze route error");

      const data = await res.json();
      
      // If severe crisis triggered from journal, pop Crisis Modal immediately!
      if (data.crisisDetected) {
        setIsCrisisOpen(true);
      }

      const todayString = new Date().toISOString().split("T")[0];

      // Formulate final Journal log with analysis schemas
      const entry: Omit<JournalEntry, "id" | "userId"> = {
        content: journalContent,
        date: todayString,
        analysis: {
          reflection: data.reflection,
          emotions: data.emotions,
          gratitudeItems: data.gratitudeItems || [],
          crisisLevel: data.crisisLevel || "safe",
          cognitiveTriggers: data.cognitiveTriggers || [],
          crisisDetected: data.crisisDetected || false
        }
      };

      const savedEntry = await saveJournalEntry(user.uid, entry);
      setJournals((prev) => [savedEntry, ...prev]);
      setLatestJournalAnalysis(entry.analysis as JournalAnalysis);

      // Auto-extract gratitude items and save them to database collection!
      if (data.gratitudeItems && data.gratitudeItems.length > 0) {
        for (const itemText of data.gratitudeItems) {
          const grat = await saveGratitudeItem(user.uid, itemText, todayString);
          setGratitudeItems((prev) => [grat, ...prev]);
        }
      }

    } catch (err) {
      console.error("Journal analysis error:", err);
      const fallbackEntry = await saveJournalEntry(user.uid, {
        content: journalContent,
        date: new Date().toISOString().split("T")[0],
      });
      setJournals((prev) => [fallbackEntry, ...prev]);
    } finally {
      setIsAnalyzingJournal(false);
    }
  };

  // Delete Journal
  const handleDeleteJournal = async (id: string) => {
    if (!user) return;
    await deleteJournalEntry(user.uid, id);
    setJournals((prev) => prev.filter((j) => j.id !== id));
  };

  // Add Custom Gratitude
  const handleAddGratitude = async (text: string) => {
    if (!user) return;
    const todayString = new Date().toISOString().split("T")[0];
    const item = await saveGratitudeItem(user.uid, text, todayString);
    setGratitudeItems((prev) => [item, ...prev]);
  };

  // Save Settings
  const handleSaveProfile = async (updated: UserProfile) => {
    if (!user) return;
    await saveProfile(user.uid, updated);
    setProfile(updated);
  };

  // Clear data sovereignty
  const handleClearAllData = async () => {
    if (!user) return;
    localStorage.clear();
    // Overwrite to empty
    await saveProfile(user.uid, {
      name: "Friend",
      email: user.email || "",
      primaryFocus: "stress relief",
      reminderTime: "21:00",
      notificationsEnabled: true,
      privacyMode: false
    });
    setMoodLogs([]);
    setJournals([]);
    setGratitudeItems([]);
    setChatMessages([]);
    setCurrentTab("dashboard");
  };

  // Dynamic authentication success handler
  const handleAuthSuccess = async (authenticatedUser: any) => {
    setUser(authenticatedUser);
    setLoading(true);

    const isAnonymous = authenticatedUser.isAnonymous || authenticatedUser.uid === "guest_user_123";
    const activeEmail = authenticatedUser.email || (isAnonymous ? "guest@thera.co" : `${authenticatedUser.uid.substring(0,8)}@thera.co`);
    
    // Load or create secure user profile
    const userProfile = await getProfile(authenticatedUser.uid, activeEmail);
    if (isAnonymous) {
      userProfile.name = userProfile.name === "Friend" || !userProfile.name ? "Guest Mindful Traveler" : userProfile.name;
    }
    setProfile(userProfile);

    // Fetch and sync all user-specific collections
    const moods = await getMoodLogs(authenticatedUser.uid);
    setMoodLogs(moods);

    const loadedJournals = await getJournalEntries(authenticatedUser.uid);
    setJournals(loadedJournals);

    const gratitude = await getGratitudeItems(authenticatedUser.uid);
    setGratitudeItems(gratitude);

    const chat = await getChatHistory(authenticatedUser.uid);
    setChatMessages(chat);

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="font-mono text-xs text-slate-500 mt-4 uppercase tracking-widest">Opening THERA Sanctuary...</span>
      </div>
    );
  }

  // If unauthorized, present comforting Auth screen
  if (!user || !profile) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  // If authorized but stress quiz is not taken, display onboarding assessment
  if (!profile.quizResult) {
    return (
      <StressQuiz 
        userName={profile.name || "Friend"} 
        onComplete={async (quizResult) => {
          const updatedProfile = { ...profile, quizResult };
          setProfile(updatedProfile);
          await saveProfile(user.uid, updatedProfile);
        }}
        onSkip={async () => {
          const defaultQuizResult = {
            score: 13,
            anxietyLevel: "Moderate" as const,
            takenAt: new Date().toISOString(),
            answers: [3, 3, 2, 3, 2],
            recommendedTherapy: "Cognitive Reappraisal, Distress Tolerance Training, and Restorative Diaphragmatic Breathing"
          };
          const updatedProfile = { ...profile, quizResult: defaultQuizResult };
          setProfile(updatedProfile);
          await saveProfile(user.uid, updatedProfile);
        }}
      />
    );
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-100 via-indigo-50/40 to-sky-50/50 flex flex-col md:flex-row text-slate-800 font-sans selection:bg-indigo-600 selection:text-white overflow-hidden relative md:p-0 gap-0">
      
      {/* Immersive ambient glowing sensory bubbles */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-200/30 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute top-[35%] right-10 w-80 h-80 bg-sky-200/25 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-40 left-[25%] w-[450px] h-[450px] bg-pink-100/15 rounded-full blur-[130px] pointer-events-none" />

      {/* Side Navigation panel */}
      <Sidebar 
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        userEmail={profile.email}
        userName={profile.name}
        onLogout={handleLogout}
        onTriggerCrisis={() => setIsCrisisOpen(true)}
        theme={profile.theme || "light"}
        onThemeChange={async (newTheme) => {
          const updatedProfile = { ...profile, theme: newTheme };
          setProfile(updatedProfile);
          await saveProfile(user.uid, updatedProfile);
        }}
      />

      {/* Main Sanctuary content workspace area */}
      <main className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6 h-full md:h-[calc(100vh-3rem)] md:my-6 md:mr-6 md:rounded-3xl md:bg-white/75 md:backdrop-blur-md md:border md:border-slate-200/80 md:shadow-2xl md:shadow-slate-200/10 transition-all duration-300 relative z-10">
        {currentTab === "dashboard" && (
          <Dashboard 
            userId={user.uid}
            profile={profile}
            moodLogs={moodLogs}
            journals={journals}
            gratitudeItems={gratitudeItems}
            onOpenCheckIn={() => setIsCheckInOpen(true)}
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onRetakeQuiz={async () => {
              const { quizResult, ...restProfile } = profile;
              setProfile(restProfile);
              await saveProfile(user.uid, restProfile);
            }}
          />
        )}

        {currentTab === "chat" && (
          <TherapistChat 
            userId={user.uid}
            profile={profile}
            messages={chatMessages}
            onSendMessage={handleSendChatMessage}
            isGenerating={isGeneratingChat}
            onSelectBreathing={() => setCurrentTab("breathing")}
          />
        )}

        {currentTab === "journal" && (
          <CognitiveJournal 
            userId={user.uid}
            entries={journals}
            gratitudeItems={gratitudeItems}
            onSaveEntry={handleSaveJournalEntry}
            onDeleteEntry={handleDeleteJournal}
            onAddGratitude={handleAddGratitude}
            isAnalyzing={isAnalyzingJournal}
            latestAnalysis={latestJournalAnalysis}
          />
        )}

        {currentTab === "breathing" && <BreathingWidget />}

        {currentTab === "settings" && (
          <ProfileSettings 
            profile={profile}
            onSave={handleSaveProfile}
            onClearAllData={handleClearAllData}
          />
        )}
      </main>

      {/* Unified Modals layer */}
      <MoodLogModal 
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        onSave={handleSaveCheckIn}
      />

      <CrisisModal 
        isOpen={isCrisisOpen}
        onClose={() => setIsCrisisOpen(false)}
      />

      {/* In-app breathing exercise notification toast */}
      <AnimatePresence>
        {showBreathingReminder && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-5 right-5 z-50 max-w-md w-[calc(100vw-2.5rem)] sm:w-96 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xl p-5 flex flex-col gap-4 font-sans border-l-4 border-l-indigo-500"
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                <Wind className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-slate-800 tracking-tight">Time for a Breathing Break! 🌸</h4>
                  <button 
                    onClick={() => setShowBreathingReminder(false)}
                    className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your daily reminder is here. Take a peaceful moment to relax your body and clear your mind with a quick breathing exercise.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 justify-end">
              <button
                onClick={() => setShowBreathingReminder(false)}
                className="py-1.5 px-3.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Maybe Later
              </button>
              <button
                onClick={() => {
                  setShowBreathingReminder(false);
                  setCurrentTab("breathing");
                }}
                className="py-1.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-150 transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>Start Breathing</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
