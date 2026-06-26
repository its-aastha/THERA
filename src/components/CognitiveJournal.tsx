import React, { useState, useRef, useEffect } from "react";
import { JournalEntry, JournalAnalysis, GratitudeItem } from "../types";
import { BookOpen, Sparkles, Smile, Trash2, ShieldCheck, Heart, Calendar, ArrowRight, Check, Mic, MicOff, AlertTriangle } from "lucide-react";

interface CognitiveJournalProps {
  userId: string;
  entries: JournalEntry[];
  gratitudeItems: GratitudeItem[];
  onSaveEntry: (content: string) => Promise<void>;
  onDeleteEntry: (id: string) => Promise<void>;
  onAddGratitude: (text: string) => Promise<void>;
  isAnalyzing: boolean;
  latestAnalysis: JournalAnalysis | null;
}

export default function CognitiveJournal({
  userId,
  entries,
  gratitudeItems,
  onSaveEntry,
  onDeleteEntry,
  onAddGratitude,
  isAnalyzing,
  latestAnalysis
}: CognitiveJournalProps) {
  const [content, setContent] = useState("");
  const [activeTab, setActiveTab] = useState<"write" | "history" | "gratitude">("write");
  const [customGratitude, setCustomGratitude] = useState("");
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleRecording = () => {
    setSpeechError(null);
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setSpeechError("Speech recognition is not supported in this browser. Please use Google Chrome, Apple Safari, or Microsoft Edge.");
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      try {
        const recognition = new SpeechRecognitionClass();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onstart = () => {
          setIsRecording(true);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event);
          if (event.error === "not-allowed") {
            setSpeechError("Microphone access denied. Please allow microphone permission in your browser's address bar settings.");
          } else {
            setSpeechError(`Voice input error: ${event.error}. Please check your audio connection.`);
          }
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.onresult = (event: any) => {
          const currentResult = event.results[event.results.length - 1];
          if (currentResult && currentResult.isFinal) {
            const transcript = currentResult[0].transcript;
            setContent((prev) => {
              const cleanedPrev = prev.trim();
              return cleanedPrev ? `${cleanedPrev} ${transcript}` : transcript;
            });
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err: any) {
        console.error("Failed to start speech recognition", err);
        setSpeechError("Could not access microphone or launch speech recognizer.");
        setIsRecording(false);
      }
    }
  };

  const handlePublishJournal = async () => {
    const clean = content.trim();
    if (!clean || isAnalyzing) return;
    await onSaveEntry(clean);
    setContent("");
    // Switch to history tab to view analysis immediately!
    setActiveTab("history");
  };

  const handleAddGratitudeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customGratitude.trim();
    if (clean) {
      await onAddGratitude(clean);
      setCustomGratitude("");
    }
  };

  return (
    <div className="w-full space-y-6 p-1">
      
      {/* Tab Selectors */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-2xl font-sans font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            <span>Therapeutic Reflection Journal</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">Write your heart out. Let AI extract emotions, discover cognitive distortions, and highlight gratitude.</p>
        </div>

        <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab("write")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "write" ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/10" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Write Entry
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "history" ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/10" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Journal History ({entries.length})
          </button>
          <button
            onClick={() => setActiveTab("gratitude")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "gratitude" ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/10" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Gratitude Circle ({gratitudeItems.length})
          </button>
        </div>
      </div>

      {/* 1. WRITE TAB */}
      {activeTab === "write" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Writing Area (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative">
              <textarea
                placeholder="What's sitting heavily on your mind today? Express your raw feelings, describe situations, or recount a dream. Your words remain completely private..."
                rows={12}
                value={content}
                disabled={isAnalyzing}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-white border border-slate-200 shadow-xs rounded-2xl p-5 text-slate-800 text-sm focus:outline-none focus:border-indigo-500/80 leading-relaxed placeholder:text-slate-400 resize-none"
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-1.5 text-[10px] font-mono text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Private Sandbox</span>
              </div>
            </div>

            {speechError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{speechError}</span>
              </div>
            )}

            <div className="flex justify-between items-center gap-3">
              {/* Record Voice Thoughts */}
              <button
                type="button"
                onClick={toggleRecording}
                disabled={isAnalyzing}
                className={`px-5 py-3 font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                  isRecording
                    ? "bg-red-600 hover:bg-red-500 text-white animate-pulse shadow-md shadow-red-600/10"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                }`}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-4.5 h-4.5" />
                    <span>Listening... Tap to Stop</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4.5 h-4.5 text-indigo-600" />
                    <span>Record Thoughts (Voice)</span>
                  </>
                )}
              </button>

              <button
                onClick={handlePublishJournal}
                disabled={isAnalyzing || !content.trim()}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/10 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Cognitive Patterns...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white fill-white" />
                    <span>Analyze & Secure Entry</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Guidelines / Tips (4 cols) */}
          <div className="lg:col-span-4 p-5 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-slate-800">
              <Heart className="w-4.5 h-4.5 text-indigo-600" />
              <h3 className="font-sans font-bold text-xs tracking-wider uppercase">CBT Writing Prompts</h3>
            </div>
            <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed">
              <p>Unsure how to start? Pick an inquiry:</p>
              <ul className="space-y-3 list-disc pl-4 text-slate-600">
                <li><strong className="text-slate-800">Emotional Unload:</strong> "Right now, I am feeling incredibly... because..."</li>
                <li><strong className="text-slate-800">Cognitive Reappraisal:</strong> Describe a recent setback, how you felt, and try asking: "What is an alternative, kinder way to interpret this?"</li>
                <li><strong className="text-slate-800">Future Hope:</strong> What are you looking forward to, or what is one minor boundary you can draw tomorrow?</li>
              </ul>
              <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                AI Journal utilizes advanced Cognitive Behavioral Therapy (CBT) models to analyze cognitive distortion triggers.
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 2. HISTORY TAB */}
      {activeTab === "history" && (
        <div className="space-y-4">
          {entries.length === 0 ? (
            <div className="py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center space-y-2">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-sans font-semibold text-slate-700 text-sm">No journal logs recorded yet</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">Write down your first daily reflection entry to get immediate therapeutic insights and emotional trackers.</p>
              <button
                onClick={() => setActiveTab("write")}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-indigo-600 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
              >
                Start Journaling
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => {
                const isExpanded = expandedEntryId === entry.id;
                const d = new Date(entry.date);
                const formattedDate = d.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
                const previewText = entry.content.substring(0, 150) + (entry.content.length > 150 ? "..." : "");

                return (
                  <div 
                    key={entry.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:border-slate-300 transition-all"
                  >
                    {/* Header bar click to expand */}
                    <div 
                      onClick={() => setExpandedEntryId(isExpanded ? null : entry.id)}
                      className="p-5 flex items-center justify-between gap-4 cursor-pointer select-none bg-slate-50/50"
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-indigo-600" />
                        <div>
                          <h4 className="text-sm font-semibold text-slate-800">{formattedDate}</h4>
                          {!isExpanded && <p className="text-xs text-slate-500 mt-1 line-clamp-1">{previewText}</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {entry.analysis?.crisisLevel && entry.analysis?.crisisLevel !== "safe" && (
                          <span className="text-[9px] font-mono font-bold bg-red-50 text-red-700 px-2 py-0.5 border border-red-100 rounded-full">
                            Tension Alert
                          </span>
                        )}
                        <span className="text-xs text-indigo-600 font-semibold hover:text-indigo-700">
                          {isExpanded ? "Collapse Entry" : "View Insights"}
                        </span>
                      </div>
                    </div>

                    {/* Expanded Insights zone */}
                    {isExpanded && (
                      <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-5 animate-in slide-in-from-top-2 duration-200">
                        
                        {/* Raw User content */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">Your Entry</span>
                          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100/60 font-sans whitespace-pre-line">{entry.content}</p>
                        </div>

                        {/* AI Insights block */}
                        {entry.analysis ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                            
                            {/* Reflection & distortions */}
                            <div className="p-4 rounded-xl bg-indigo-50/40 border border-indigo-100 space-y-3">
                              <div className="flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4 text-indigo-600 fill-indigo-50/50" />
                                <span className="text-xs font-bold text-indigo-950 font-sans">Cognitive CBT Reflection</span>
                              </div>
                              <p className="text-xs text-slate-700 leading-relaxed">{entry.analysis.reflection}</p>
                              
                              {entry.analysis.cognitiveTriggers && entry.analysis.cognitiveTriggers.length > 0 && (
                                <div className="pt-2">
                                  <span className="text-[9px] font-mono text-slate-400 uppercase">Cognitive Triggers Found</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {entry.analysis.cognitiveTriggers.map((trig, idx) => (
                                      <span key={idx} className="text-[9px] px-2 py-0.5 bg-white text-slate-600 border border-slate-200/60 rounded-full font-semibold shadow-xs">
                                        {trig}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Emotions breakdown & Gratitudes */}
                            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                              
                              {/* Emotions */}
                              <div className="space-y-2">
                                <span className="text-[10px] font-mono text-slate-400 uppercase">Emotional Distribution</span>
                                <div className="grid grid-cols-3 gap-2">
                                  {Object.entries(entry.analysis.emotions).map(([emotion, score]) => (
                                    <div key={emotion} className="bg-white border border-slate-200 p-2 rounded-lg flex flex-col text-center shadow-xs">
                                      <span className="text-[9px] text-slate-500 capitalize">{emotion}</span>
                                      <span className="text-xs font-mono font-bold text-slate-700 mt-0.5">{score}%</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Gratitudes extracted */}
                              {entry.analysis.gratitudeItems && entry.analysis.gratitudeItems.length > 0 && (
                                <div className="pt-2 border-t border-slate-200">
                                  <span className="text-[10px] font-mono text-emerald-700 uppercase flex items-center gap-1 font-bold">
                                    <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                                    <span>Auto-Extracted Gratitude</span>
                                  </span>
                                  <ul className="list-disc pl-4 text-xs text-slate-600 mt-1.5 space-y-1">
                                    {entry.analysis.gratitudeItems.map((item, index) => (
                                      <li key={index} className="italic text-slate-800">{item}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                            </div>

                          </div>
                        ) : (
                          <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
                            CBT analysis is unavailable for this entry.
                          </div>
                        )}

                        {/* Footer delete */}
                        <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                          <button
                            onClick={() => onDeleteEntry(entry.id)}
                            className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200/40 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Entry</span>
                          </button>
                        </div>

                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. GRATITUDE CIRCLE TAB */}
      {activeTab === "gratitude" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Add custom gratitude form (4 cols) */}
          <div className="lg:col-span-4 p-5 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-4">
            <div>
              <h3 className="font-sans font-bold text-sm text-slate-800 flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500 fill-red-500/10" />
                <span>Cultivate Daily Gratitude</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">Gratitude shifting helps re-wire negative cognitive neural pathways.</p>
            </div>

            <form onSubmit={handleAddGratitudeSubmit} className="space-y-3 pt-2">
              <input
                type="text"
                placeholder="I am incredibly grateful for..."
                required
                value={customGratitude}
                onChange={(e) => setCustomGratitude(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-850 focus:outline-none focus:border-indigo-500/80 focus:bg-white"
              />
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1 shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-3" />
                <span>Log Gratitude</span>
              </button>
            </form>
          </div>

          {/* List of gratitudes (8 cols) */}
          <div className="lg:col-span-8 space-y-3">
            <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Your Gratitude Repository</h3>

            {gratitudeItems.length === 0 ? (
              <div className="p-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center space-y-1">
                <Heart className="w-7 h-7 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-600">Your gratitude repository is empty.</p>
                <p className="text-[10px] text-slate-400">Log standard journal entries with positive details, or type a gratitude block on the left to start collecting positive moments.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {gratitudeItems.map((item) => (
                  <div 
                    key={item.id}
                    className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl relative overflow-hidden group hover:border-emerald-300 transition-all flex items-start gap-3"
                  >
                    <Smile className="w-4.5 h-4.5 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-800 leading-relaxed font-sans font-medium">"{item.text}"</p>
                      <span className="text-[9px] font-mono text-emerald-700 block mt-1.5">
                        {new Date(item.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
