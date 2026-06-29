import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, UserProfile, Emotions } from "../types";
import { Send, Sparkles, HelpCircle, AlertOctagon, Heart, Brain, Wind, X } from "lucide-react";

interface TherapistChatProps {
  userId: string;
  profile: UserProfile;
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isGenerating: boolean;
  onSelectBreathing: () => void;
}

export default function TherapistChat({ 
  userId, 
  profile, 
  messages, 
  onSendMessage, 
  isGenerating,
  onSelectBreathing
}: TherapistChatProps) {
  const [inputText, setInputText] = useState("");
  const [showMobileStats, setShowMobileStats] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isGenerating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || isGenerating) return;

    onSendMessage(text);
    setInputText("");
  };

  const handleSuggestionClick = (suggestionText: string) => {
    if (isGenerating) return;
    onSendMessage(suggestionText);
  };

  // Get active emotions from the latest therapeutic message
  const getLatestEmotions = (): Emotions | null => {
    const aiMessages = [...messages].filter((m) => m.role === "assistant" && m.detectedEmotions);
    if (aiMessages.length === 0) return null;
    return aiMessages[aiMessages.length - 1].detectedEmotions || null;
  };

  const activeEmotions = getLatestEmotions();

  // Pick suggestions from the latest model response
  const getLatestSuggestions = (): string[] => {
    const aiMessages = [...messages].filter((m) => m.role === "assistant" && m.suggestions);
    if (aiMessages.length === 0) {
      return [
        "I'm feeling anxious about work today",
        "Can you guide me through a mindful exercise?",
        "I have a lot of thoughts racing in my head"
      ];
    }
    return aiMessages[aiMessages.length - 1].suggestions || [];
  };

  const currentSuggestions = getLatestSuggestions();

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-160px)] p-1">
      
      {/* Chat Thread Panel (8 Cols) */}
      <div className="lg:col-span-8 flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
        
        {/* Chat Header banner */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-slate-800 tracking-tight leading-tight">THERA AI Therapist</h3>
              <p className="text-[10px] font-mono tracking-wider text-indigo-600 uppercase">Interactive CBT & Reflection Mode</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={() => setShowMobileStats(true)}
              className="lg:hidden flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-lg transition-colors cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" />
              <span>Emotions</span>
            </button>
            <span className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-bold">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              <span>Memory Active</span>
            </span>
          </div>
        </div>

        {/* Scrollable messages zone */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          
          {/* Empathetic therapist starting card */}
          {messages.length === 0 && (
            <div className="p-6 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-3 max-w-xl mx-auto text-center">
              <Heart className="w-8 h-8 text-indigo-600 mx-auto fill-indigo-50/50" />
              <h4 className="font-sans font-bold text-slate-800 text-sm">Welcome to your secure reflection space, {profile.name || "friend"}.</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                I am here to offer a warm, safe, and entirely confidential outlet for your thoughts. 
                Whether you wish to unpack work anxiety, discuss life stressors, analyze a cognitive struggle, or simply rest, I will guide and reflect with you.
              </p>
              <div className="text-[10px] text-slate-400">
                Type anything below or click one of the suggested paths to begin.
              </div>
            </div>
          )}

          {/* Interactive list */}
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div 
                key={msg.id} 
                className={`flex gap-4 max-w-3xl ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-sans font-bold text-xs uppercase border ${
                  isUser 
                    ? "bg-slate-100 border-slate-200 text-slate-700" 
                    : "bg-indigo-50 border-indigo-100 text-indigo-600"
                }`}>
                  {isUser ? (profile.name || "U").substring(0,2) : "AI"}
                </div>

                <div className="space-y-2">
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    isUser 
                      ? "bg-indigo-600 text-white font-medium rounded-tr-none shadow-sm shadow-indigo-600/10" 
                      : "bg-slate-100 border border-slate-200/60 text-slate-700 rounded-tl-none whitespace-pre-line"
                  }`}>
                    {msg.content}
                  </div>
                  
                  {/* Message timestamp */}
                  <div className={`text-[10px] font-mono text-slate-400 ${isUser ? "text-right" : "text-left"}`}>
                    {new Date(msg.timestamp).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Generator visual loading */}
          {isGenerating && (
            <div className="flex gap-4 mr-auto animate-pulse">
              <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-indigo-600 text-xs font-bold font-mono shrink-0">
                AI
              </div>
              <div className="p-4 bg-slate-100 border border-slate-200 rounded-2xl rounded-tl-none text-xs text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                <span className="font-mono text-slate-400 italic ml-1">THERA reflecting...</span>
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>

        {/* Suggestion tags block */}
        {!isGenerating && currentSuggestions.length > 0 && (
          <div className="px-6 py-3 border-t border-slate-200/60 bg-slate-50 flex flex-wrap gap-2 items-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">Suggested responses:</span>
            {currentSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-2.5 py-1 text-xs bg-white hover:bg-slate-100 text-indigo-600 border border-slate-200 hover:border-indigo-300 rounded-lg cursor-pointer transition-all text-left truncate max-w-[280px]"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Form panel input */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder={isGenerating ? "Reflecting on your words..." : "Vent, express feelings, ask for CBT help..."}
              disabled={isGenerating}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/80 focus:bg-slate-100 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isGenerating || !inputText.trim()}
              className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-indigo-600/10 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4 text-white fill-white" />
            </button>
          </form>
        </div>

      </div>

      {/* Side Emotional Mapping Display (4 Cols) - Hidden on mobile/tablets, shown on lg screens */}
      <div className="lg:col-span-4 hidden lg:flex flex-col gap-6 overflow-y-auto max-h-full pr-1">
        
        {/* Active Emotions analysis */}
        <div className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-4">
          <div>
            <h3 className="text-sm font-sans font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Real-time Active Emotions</span>
            </h3>
            <p className="text-xs text-slate-500">Calculated dynamic response analysis.</p>
          </div>

          <div className="space-y-3">
            {activeEmotions ? (
              Object.entries(activeEmotions).map(([emotion, score]) => {
                const barColors: { [key: string]: string } = {
                  calm: "bg-indigo-500",
                  joy: "bg-emerald-500",
                  anxiety: "bg-amber-500",
                  sadness: "bg-blue-500",
                  anger: "bg-red-500",
                  overwhelm: "bg-violet-500"
                };

                return (
                  <div key={emotion} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600 capitalize">{emotion}</span>
                      <span className="font-mono text-slate-400 font-bold">{score}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ${barColors[emotion] || "bg-indigo-500"}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs text-slate-400 space-y-2">
                <HelpCircle className="w-7 h-7 text-slate-300 mx-auto" />
                <p>Send a message to let THERA analyze your session emotions in real-time.</p>
              </div>
            )}
          </div>
        </div>

        {/* Immediate Coping Suggestions panel */}
        <div className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-4">
          <div>
            <h3 className="text-sm font-sans font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Wind className="w-4 h-4 text-violet-600" />
              <span>Immediate Grounding Options</span>
            </h3>
            <p className="text-xs text-slate-500">Need immediate release from anxious looping?</p>
          </div>

          <div className="space-y-2">
            <button
              onClick={onSelectBreathing}
              className="w-full p-3 bg-slate-50 hover:bg-slate-100 text-left rounded-xl border border-slate-150 hover:border-indigo-300 transition-all text-xs flex items-center justify-between group cursor-pointer"
            >
              <div className="space-y-0.5">
                <span className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">Start Guided Breathing</span>
                <p className="text-slate-500 text-[10px]">Follow visual circular expansions to ground.</p>
              </div>
              <Wind className="w-4 h-4 text-indigo-600 group-hover:animate-pulse" />
            </button>

            <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex gap-2.5">
              <AlertOctagon className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-[11px]">
                <span className="font-semibold text-red-700">Feeling Overwhelmed?</span>
                <p className="text-slate-600">If you are in severe distress or require immediate intervention, click "Emergency Help (988)" in the sidebar footer.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Mobile Stats & Grounding Options Modal */}
      {showMobileStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs lg:hidden animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                <span className="font-sans font-bold text-slate-800 text-sm">Dynamic Emotions & Coping</span>
              </div>
              <button 
                onClick={() => setShowMobileStats(false)}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-6">
              {/* Active Emotions analysis */}
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Real-time Active Emotions</h4>
                  <p className="text-[11px] text-slate-500">Calculated dynamic response analysis.</p>
                </div>

                <div className="space-y-3 pt-1">
                  {activeEmotions ? (
                    Object.entries(activeEmotions).map(([emotion, score]) => {
                      const barColors: { [key: string]: string } = {
                        calm: "bg-indigo-500",
                        joy: "bg-emerald-500",
                        anxiety: "bg-amber-500",
                        sadness: "bg-blue-500",
                        anger: "bg-red-500",
                        overwhelm: "bg-violet-500"
                      };

                      return (
                        <div key={emotion} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-600 capitalize">{emotion}</span>
                            <span className="font-mono text-slate-400 font-bold">{score}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-700 ${barColors[emotion] || "bg-indigo-500"}`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-4 text-center text-xs text-slate-400 space-y-2">
                      <HelpCircle className="w-6 h-6 text-slate-300 mx-auto" />
                      <p>Send a message to let THERA analyze your session emotions in real-time.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Immediate Coping Suggestions panel */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Immediate Grounding Options</h4>
                  <p className="text-[11px] text-slate-500">Need immediate release from anxious looping?</p>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => {
                      onSelectBreathing();
                      setShowMobileStats(false);
                    }}
                    className="w-full p-3 bg-slate-50 hover:bg-slate-100 text-left rounded-xl border border-slate-150 hover:border-indigo-300 transition-all text-xs flex items-center justify-between group cursor-pointer"
                  >
                    <div className="space-y-0.5">
                      <span className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">Start Guided Breathing</span>
                      <p className="text-slate-500 text-[10px]">Follow visual circular expansions to ground.</p>
                    </div>
                    <Wind className="w-4 h-4 text-indigo-600 group-hover:animate-pulse" />
                  </button>

                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex gap-2.5">
                    <AlertOctagon className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div className="space-y-0.5 text-[10px] leading-relaxed">
                      <span className="font-semibold text-red-700">Feeling Overwhelmed?</span>
                      <p className="text-slate-600">If you are in severe distress, click "Emergency Help (988)" in the sidebar.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
