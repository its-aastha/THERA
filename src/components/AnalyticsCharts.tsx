import React, { useState } from "react";
import { MoodLog, JournalEntry } from "../types";
import { Smile, Zap, Moon, Activity, Tag, HelpCircle, Calendar } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface AnalyticsChartsProps {
  moodLogs: MoodLog[];
  journals: JournalEntry[];
}

export default function AnalyticsCharts({ moodLogs, journals }: AnalyticsChartsProps) {
  const [timeRange, setTimeRange] = useState<"7" | "30">("30");

  // Process logs in chronological order for the trend chart
  const sortedLogs = [...moodLogs]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const displayLogs = timeRange === "7" ? sortedLogs.slice(-7) : sortedLogs.slice(-30);

  const chartData = displayLogs.map((log) => {
    const d = new Date(log.date + "T00:00:00");
    const formattedDate = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return {
      date: formattedDate,
      rawDate: log.date,
      mood: log.mood,
      energy: log.energy,
      sleep: log.sleep,
      notes: log.notes || "",
    };
  });

  // Calculate Average statistics
  const totalLogsCount = moodLogs.length;
  const avgMood = totalLogsCount ? (moodLogs.reduce((acc, l) => acc + l.mood, 0) / totalLogsCount).toFixed(1) : "0.0";
  const avgEnergy = totalLogsCount ? (moodLogs.reduce((acc, l) => acc + l.energy, 0) / totalLogsCount).toFixed(1) : "0.0";
  const avgSleep = totalLogsCount ? (moodLogs.reduce((acc, l) => acc + l.sleep, 0) / totalLogsCount).toFixed(1) : "0.0";

  // Process Tags count
  const tagCounts: { [tag: string]: number } = {};
  moodLogs.forEach((log) => {
    log.tags.forEach((t) => {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    });
  });
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5); // top 5 tags

  // Process Average emotions from AI journal analyses and dynamically synthesized daily metrics (mood, sleep, energy, physical feel)
  const analyzedJournals = journals.filter((j) => j.analysis && j.analysis.emotions);
  const emotionPointsList: Array<{ calm: number; joy: number; anxiety: number; sadness: number; anger: number; overwhelm: number }> = [];

  // 1. Add emotions from journal analyses
  analyzedJournals.forEach((j) => {
    if (j.analysis?.emotions) {
      emotionPointsList.push({
        calm: j.analysis.emotions.calm ?? 0,
        joy: j.analysis.emotions.joy ?? 0,
        anxiety: j.analysis.emotions.anxiety ?? 0,
        sadness: j.analysis.emotions.sadness ?? 0,
        anger: j.analysis.emotions.anger ?? 0,
        overwhelm: j.analysis.emotions.overwhelm ?? 0,
      });
    }
  });

  // 2. Synthesize/calculate emotions dynamically from daily metrics (mood, energy, sleep, physicalFeel)
  moodLogs.forEach((log) => {
    const moodVal = log.mood ?? 3;
    const energyVal = log.energy ?? 3;
    const sleepVal = log.sleep ?? 3;
    const physicalVal = log.physicalFeel ?? 3;

    // Derived emotions calculation based on metrics
    let calm = Math.round((moodVal * 12) + (sleepVal * 8));
    let joy = Math.round((moodVal * 14) + (energyVal * 6));
    let anxiety = Math.round((6 - moodVal) * 12 + (6 - sleepVal) * 8);
    let sadness = Math.round((6 - moodVal) * 20);
    let anger = Math.round((6 - moodVal) * 10 + (6 - physicalVal) * 10);
    let overwhelm = Math.round((6 - energyVal) * 12 + (6 - sleepVal) * 8);

    // Contextual metric enhancements based on tagged triggers
    if (log.tags && log.tags.some(t => ["Anxiety", "Work", "Stress", "Loneliness"].includes(t))) {
      anxiety = Math.min(100, anxiety + 15);
      overwhelm = Math.min(100, overwhelm + 10);
      calm = Math.max(10, calm - 15);
    }
    if (log.tags && log.tags.some(t => ["Health", "Exercise", "Sleep", "Hobbies"].includes(t)) && moodVal >= 3) {
      calm = Math.min(100, calm + 10);
      joy = Math.min(100, joy + 5);
    }

    emotionPointsList.push({
      calm: Math.max(10, Math.min(100, calm)),
      joy: Math.max(10, Math.min(100, joy)),
      anxiety: Math.max(10, Math.min(100, anxiety)),
      sadness: Math.max(10, Math.min(100, sadness)),
      anger: Math.max(10, Math.min(100, anger)),
      overwhelm: Math.max(10, Math.min(100, overwhelm))
    });
  });

  const totalPointsCount = emotionPointsList.length || 1;
  const emotionSums = { calm: 0, joy: 0, anxiety: 0, sadness: 0, anger: 0, overwhelm: 0 };
  
  emotionPointsList.forEach((point) => {
    emotionSums.calm += point.calm;
    emotionSums.joy += point.joy;
    emotionSums.anxiety += point.anxiety;
    emotionSums.sadness += point.sadness;
    emotionSums.anger += point.anger;
    emotionSums.overwhelm += point.overwhelm;
  });

  const avgEmotions = {
    calm: Math.round(emotionSums.calm / totalPointsCount),
    joy: Math.round(emotionSums.joy / totalPointsCount),
    anxiety: Math.round(emotionSums.anxiety / totalPointsCount),
    sadness: Math.round(emotionSums.sadness / totalPointsCount),
    anger: Math.round(emotionSums.anger / totalPointsCount),
    overwhelm: Math.round(emotionSums.overwhelm / totalPointsCount),
  };

  // Custom tooltips to present granular check-in elements beautifully
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const moodDescriptions: { [key: number]: string } = {
        1: "Struggling 💔",
        2: "Heavy 🌧️",
        3: "Balanced ⚖️",
        4: "Peaceful ✨",
        5: "Radiant 🌟"
      };
      return (
        <div className="bg-white border border-slate-200/90 p-3 rounded-xl shadow-lg space-y-1.5 text-xs text-slate-700">
          <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">{data.rawDate}</p>
          <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100">
            <span className="font-semibold text-slate-500">Mood:</span>
            <span className="font-bold text-indigo-600">{data.mood} / 5</span>
            <span className="text-[11px] text-slate-400 font-medium">({moodDescriptions[data.mood] || "Steady"})</span>
          </div>
          {(data.energy !== undefined || data.sleep !== undefined) && (
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-slate-500">
              <div className="flex items-center gap-1">
                <span>⚡ Energy:</span>
                <span className="font-bold text-slate-700">{data.energy}/5</span>
              </div>
              <div className="flex items-center gap-1">
                <span>🌙 Sleep:</span>
                <span className="font-bold text-slate-700">{data.sleep}/5</span>
              </div>
            </div>
          )}
          {data.notes && (
            <p className="text-[10px] text-slate-500 italic max-w-[180px] break-words pt-1 border-t border-slate-50 leading-relaxed">
              "{data.notes}"
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Map mood value to a text color / description
  const getMoodString = (val: number) => {
    if (val >= 4.5) return "Radiant 🌟";
    if (val >= 3.8) return "Peaceful ✨";
    if (val >= 2.8) return "Balanced ⚖️";
    if (val >= 1.8) return "Heavy 🌧️";
    return "Struggling 💔";
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Quick Stats Summary Bento */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Mood Average */}
        <div className="p-4 bg-white border border-slate-200 shadow-sm rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 text-indigo-600">
            <Smile className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">Average Mood</p>
            <p className="text-lg font-sans font-bold text-slate-800 leading-tight mt-0.5">{avgMood} <span className="text-xs text-slate-400 font-normal">/ 5</span></p>
            <p className="text-[9px] font-semibold text-indigo-600 uppercase tracking-wide mt-1">{getMoodString(Number(avgMood))}</p>
          </div>
        </div>

        {/* Energy Average */}
        <div className="p-4 bg-white border border-slate-200 shadow-sm rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100 text-amber-600">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">Energy Reserve</p>
            <p className="text-lg font-sans font-bold text-slate-800 leading-tight mt-0.5">{avgEnergy} <span className="text-xs text-slate-400 font-normal">/ 5</span></p>
            <p className="text-[9px] font-semibold text-amber-700 uppercase tracking-wide mt-1">
              {Number(avgEnergy) >= 4 ? "Charged ⚡" : Number(avgEnergy) >= 2.5 ? "Steady 🔋" : "Rest Needed 🛌"}
            </p>
          </div>
        </div>

        {/* Sleep Average */}
        <div className="p-4 bg-white border border-slate-200 shadow-sm rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center border border-violet-100 text-violet-600">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">Sleep Quality</p>
            <p className="text-lg font-sans font-bold text-slate-800 leading-tight mt-0.5">{avgSleep} <span className="text-xs text-slate-400 font-normal">/ 5</span></p>
            <p className="text-[9px] font-semibold text-violet-700 uppercase tracking-wide mt-1">
              {Number(avgSleep) >= 4 ? "Restorative 🌌" : Number(avgSleep) >= 2.5 ? "Fragmented 🌓" : "Insufficient 🌘"}
            </p>
          </div>
        </div>

        {/* Entries logged count */}
        <div className="p-4 bg-white border border-slate-200 shadow-sm rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 text-emerald-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">Total Sessions</p>
            <p className="text-lg font-sans font-bold text-slate-800 leading-tight mt-0.5">{totalLogsCount} <span className="text-xs text-slate-400 font-normal">logs</span></p>
            <p className="text-[9px] font-semibold text-emerald-700 uppercase tracking-wide mt-1">
              {journals.length} AI Journal logs
            </p>
          </div>
        </div>

      </div>

      {/* 2. Visual Charts Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Mood Line Trend Chart (8 cols) */}
        <div className="lg:col-span-8 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-sans font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" />
                <span>Mood Resilience Trend</span>
              </h3>
              <p className="text-xs text-slate-500">Visualizing wellness logs over the selected time window.</p>
            </div>
            
            {/* Dynamic selector for days */}
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200 text-[10px]">
              <button
                onClick={() => setTimeRange("7")}
                className={`px-2 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  timeRange === "7"
                    ? "bg-white text-indigo-600 shadow-xs border border-slate-200/50"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                7 Logs
              </button>
              <button
                onClick={() => setTimeRange("30")}
                className={`px-2 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  timeRange === "30"
                    ? "bg-white text-indigo-600 shadow-xs border border-slate-200/50"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                30 Days
              </button>
            </div>
          </div>

          <div className="w-full bg-slate-50/50 rounded-xl border border-slate-100 p-4">
            {displayLogs.length >= 2 ? (
              <div className="w-full h-56 relative select-none">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} 
                    />
                    <YAxis 
                      domain={[1, 5]} 
                      tickCount={5}
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} 
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="mood"
                      stroke="#4f46e5"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 1.5, stroke: '#4f46e5', fill: '#ffffff' }}
                      activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex flex-col items-center justify-center text-center p-4">
                <HelpCircle className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs text-slate-500">Log at least 2 wellness check-ins to unlock your mood trend line.</p>
              </div>
            )}
          </div>
        </div>

        {/* Emotion Distribution (4 cols) */}
        <div className="lg:col-span-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-sans font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Tag className="w-4 h-4 text-violet-600" />
              <span>AI Emotion Mapping</span>
            </h3>
            <p className="text-xs text-slate-500">Synthesized averages from journals & check-in metrics.</p>
          </div>

          <div className="space-y-3.5 pt-1.5">
            {Object.entries(emotionPointsList.length > 0 ? avgEmotions : { calm: 60, joy: 40, anxiety: 30, overwhelm: 20 })
              .sort((a, b) => b[1] - a[1])
              .map(([emotion, score]) => {
                const colors: { [key: string]: string } = {
                  calm: "bg-indigo-500",
                  joy: "bg-emerald-500",
                  anxiety: "bg-amber-500",
                  sadness: "bg-blue-500",
                  anger: "bg-red-500",
                  overwhelm: "bg-violet-500"
                };
                const displayNames: { [key: string]: string } = {
                  calm: "Calm & Peace",
                  joy: "Joy & Elation",
                  anxiety: "Anxiety & Tension",
                  sadness: "Sadness & Sorrow",
                  anger: "Anger & Irritation",
                  overwhelm: "Overwhelm & Burnout"
                };

                return (
                  <div key={emotion} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-600 capitalize">{displayNames[emotion] || emotion}</span>
                      <span className="font-mono text-slate-500 font-semibold">{score}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${colors[emotion] || "bg-indigo-500"}`}
                        style={{ width: `${Math.max(3, score)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            
            {emotionPointsList.length === 0 && (
              <p className="text-[10px] text-center text-slate-400 italic mt-3">
                Showing sample values. Log a daily check-in or write a journal entry to activate live mapping.
              </p>
            )}
          </div>
        </div>

      </div>

      {/* 3. Top Triggers & Impact Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Top Triggers */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-sans font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-600" />
              <span>Core Wellness Triggers</span>
            </h3>
            <p className="text-xs text-slate-500">Factors influencing your state most frequently.</p>
          </div>

          <div className="space-y-2.5">
            {topTags.length > 0 ? (
              topTags.map(([tag, count]) => {
                const percentage = Math.round((count / totalLogsCount) * 100);
                return (
                  <div key={tag} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-xs font-medium text-slate-700 px-2 py-0.5 bg-white rounded border border-slate-200 shadow-xs">{tag}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-1.5 bg-slate-200/60 rounded-full overflow-hidden hidden sm:block">
                        <div className="h-full bg-emerald-500" style={{ width: `${percentage}%` }} />
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-500">{count} {count === 1 ? "log" : "logs"} ({percentage}%)</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                Log daily check-ins selecting triggers to unlock detailed wellness factor breakdowns.
              </div>
            )}
          </div>
        </div>

        {/* Actionable recommendations based on averages */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-sans font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-600" />
              <span>THERA Suggested Coping Plan</span>
            </h3>
            <p className="text-xs text-slate-500">Therapeutic focus areas tailored to your current logs.</p>
          </div>

          <div className="space-y-3 text-xs leading-relaxed text-slate-600">
            {Number(avgMood) < 3.2 && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl space-y-1">
                <span className="font-semibold text-red-700">Boost Emotional Support</span>
                <p className="text-slate-600 text-[11px]">Your average mood indicates a heavy period. Try utilizing the THERA AI Therapist chat to vent, or practice 4-7-8 Breathing twice daily to steady your heartbeat.</p>
              </div>
            )}
            
            {Number(avgSleep) < 3.2 && (
              <div className="p-3 bg-violet-50 border border-violet-100 rounded-xl space-y-1">
                <span className="font-semibold text-violet-700">Optimize Wind-down Routines</span>
                <p className="text-slate-600 text-[11px]">Restless sleep degrades daytime resilience. Use "Guided Breathing" for 5 minutes right before sleeping and consider setting a strict digital curfew.</p>
              </div>
            )}

            {Number(avgEnergy) < 3.2 && (
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl space-y-1">
                <span className="font-semibold text-amber-700">Introduce Minor Restoration breaks</span>
                <p className="text-slate-600 text-[11px]">Drained reserves trigger tension. Integrate brief 3-minute "Equal Breathing" sessions during work to refresh, and write a single item in the gratitude journal to shift focus.</p>
              </div>
            )}

            {Number(avgMood) >= 3.2 && Number(avgSleep) >= 3.2 && Number(avgEnergy) >= 3.2 && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl space-y-1">
                <span className="font-semibold text-emerald-700">Maintain Positive Momentum</span>
                <p className="text-slate-600 text-[11px]">You are in a healthy, steady flow! Keep logging journals, record what is going well in the Gratitude segment, and explore deeper cognitive pattern review.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
