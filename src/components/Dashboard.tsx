import React from "react";
import { UserProfile, MoodLog, JournalEntry, GratitudeItem } from "../types";
import AnalyticsCharts from "./AnalyticsCharts";
import { Sparkles, Calendar, Smile, BookOpen, Heart, Wind, HelpCircle, ChevronRight, Zap } from "lucide-react";

interface DashboardProps {
  userId: string;
  profile: UserProfile;
  moodLogs: MoodLog[];
  journals: JournalEntry[];
  gratitudeItems: GratitudeItem[];
  onOpenCheckIn: () => void;
  onNavigateTab: (tab: string) => void;
}

export default function Dashboard({
  userId,
  profile,
  moodLogs,
  journals,
  gratitudeItems,
  onOpenCheckIn,
  onNavigateTab
}: DashboardProps) {
  
  // Check if check-in was completed today (in local timezone)
  const todayString = new Date().toISOString().split("T")[0];
  const loggedToday = moodLogs.find((l) => l.date === todayString);

  // Calculate Streak
  const getStreak = (): number => {
    if (moodLogs.length === 0) return 0;
    
    // Extract sorted unique dates (YYYY-MM-DD)
    const dates = Array.from(new Set(moodLogs.map((l) => l.date))).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    let streak = 0;
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0,0,0,0);

    const mostRecentLogDate = new Date(dates[0]);
    mostRecentLogDate.setHours(0,0,0,0);

    // If there is no log for today or yesterday, streak is broken (0)
    if (mostRecentLogDate.getTime() !== today.getTime() && mostRecentLogDate.getTime() !== yesterday.getTime()) {
      return 0;
    }

    let currentExpected = mostRecentLogDate;
    for (let i = 0; i < dates.length; i++) {
      const logDate = new Date(dates[i]);
      logDate.setHours(0,0,0,0);

      if (logDate.getTime() === currentExpected.getTime()) {
        streak++;
        // Set expected to previous day
        currentExpected.setDate(currentExpected.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const streak = getStreak();

  // Get current quote based on streak or state
  const getTherapeuticQuote = () => {
    if (streak >= 5) return "You are demonstrating outstanding resilience. Your mind appreciates this dedication.";
    if (loggedToday) return "Excellent check-in today! Taking a moment to self-evaluate builds structural neural calmness.";
    return "Your thoughts deserve a non-judgmental space. Pause for a brief check-in to align your energy.";
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 p-1">
      
      {/* 1. Welcoming Banner with streak badge */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-indigo-50/80 to-indigo-100/40 rounded-3xl border border-indigo-100/80 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        
        {/* Abstract light aura */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

        <div className="space-y-2.5 relative z-10 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider">
              {profile.primaryFocus.split(" ")[0]} Companion
            </span>
            {streak > 0 && (
              <span className="px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-200 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3 fill-amber-500" />
                <span>{streak} Day Streak</span>
              </span>
            )}
          </div>

          <h2 className="text-2xl md:text-3xl font-sans font-bold text-slate-800 tracking-tight leading-tight">
            How is your inner space today, <span className="text-indigo-600">{profile.name}</span>?
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed font-serif italic">
            "{getTherapeuticQuote()}"
          </p>
        </div>

        {/* Action Daily log button */}
        <div className="shrink-0 relative z-10">
          {loggedToday ? (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-center space-y-1.5 max-w-xs">
              <div className="flex items-center justify-center gap-1.5 text-emerald-700 text-xs font-semibold">
                <Smile className="w-4 h-4 fill-emerald-100" />
                <span>Check-in Logged!</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">Today's wellness metrics are saved. Want to adjust?</p>
              <button 
                onClick={onOpenCheckIn}
                className="text-[10px] text-indigo-600 font-bold hover:underline cursor-pointer"
              >
                Update Metrics
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenCheckIn}
              className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer hover:scale-102"
            >
              <Calendar className="w-4 h-4" />
              <span>Log Daily Check-in</span>
            </button>
          )}
        </div>

      </div>

      {/* 2. Primary Analytics Dashboard */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">MindEase Health Analytics</h3>
        <AnalyticsCharts moodLogs={moodLogs} journals={journals} />
      </div>

      {/* 3. Coping Actions Grid (Bento Boxes) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Chat box */}
        <div 
          onClick={() => onNavigateTab("chat")}
          className="p-5 bg-white hover:bg-slate-50/50 border border-slate-200 hover:border-slate-300 rounded-2xl cursor-pointer transition-all flex flex-col justify-between h-48 group select-none shadow-sm"
        >
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100 text-indigo-600">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <h4 className="font-sans font-bold text-slate-800 text-sm">Therapist AI Chat</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Unload, vent, and seek mindfulness recommendations in a supportive, empathetic, non-judgmental conversational arena.
            </p>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-indigo-600 font-semibold group-hover:translate-x-1 transition-transform">
            <span>Talk to Therapist</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* Journal box */}
        <div 
          onClick={() => onNavigateTab("journal")}
          className="p-5 bg-white hover:bg-slate-50/50 border border-slate-200 hover:border-slate-300 rounded-2xl cursor-pointer transition-all flex flex-col justify-between h-48 group select-none shadow-sm"
        >
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center border border-violet-100 text-violet-600">
              <BookOpen className="w-4.5 h-4.5" />
            </div>
            <h4 className="font-sans font-bold text-slate-800 text-sm">Cognitive Journaling</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Log daily private entries. MindEase automatically detects core cognitive distortions and extracts positive moments.
            </p>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-violet-600 font-semibold group-hover:translate-x-1 transition-transform">
            <span>Write in Journal</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* Breathing box */}
        <div 
          onClick={() => onNavigateTab("breathing")}
          className="p-5 bg-white hover:bg-slate-50/50 border border-slate-200 hover:border-slate-300 rounded-2xl cursor-pointer transition-all flex flex-col justify-between h-48 group select-none shadow-sm"
        >
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100 text-emerald-600">
              <Wind className="w-4.5 h-4.5" />
            </div>
            <h4 className="font-sans font-bold text-slate-800 text-sm">Guided Breathing</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Lower cognitive tension, relax muscle structures, and steady heart rate using customized breathing circular guide shapes.
            </p>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold group-hover:translate-x-1 transition-transform">
            <span>Practice Breathing</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

      </div>

    </div>
  );
}
