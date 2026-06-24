import React, { useState } from "react";
import { X, Check, Smile, Frown, Meh, SmilePlus, Angry, Battery, Moon, Activity, Tag, Plus } from "lucide-react";
import { MoodLog } from "../types";

interface MoodLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (log: Omit<MoodLog, "id" | "userId">) => Promise<void>;
  existingLog?: MoodLog;
}

const MOODS = [
  { value: 1, label: "Awful", color: "text-red-700 bg-red-50 border-red-100 hover:bg-red-100", icon: Angry },
  { value: 2, label: "Difficult", color: "text-orange-700 bg-orange-50 border-orange-100 hover:bg-orange-100", icon: Frown },
  { value: 3, label: "Okay", color: "text-amber-700 bg-amber-50 border-amber-100 hover:bg-amber-100", icon: Meh },
  { value: 4, label: "Good", color: "text-indigo-700 bg-indigo-50 border-indigo-100 hover:bg-indigo-100", icon: Smile },
  { value: 5, label: "Excellent", color: "text-emerald-700 bg-emerald-50 border-emerald-100 hover:bg-emerald-100", icon: SmilePlus },
];

const PRESET_TAGS = ["Work", "Relationships", "Family", "Sleep", "Health", "Social", "Exercise", "Hobbies", "Anxiety", "Loneliness", "Growth", "Weather"];

export default function MoodLogModal({ isOpen, onClose, onSave, existingLog }: MoodLogModalProps) {
  const [mood, setMood] = useState<number>(existingLog?.mood || 3);
  const [energy, setEnergy] = useState<number>(existingLog?.energy || 3);
  const [sleep, setSleep] = useState<number>(existingLog?.sleep || 3);
  const [physicalFeel, setPhysicalFeel] = useState<number>(existingLog?.physicalFeel || 3);
  const [notes, setNotes] = useState<string>(existingLog?.notes || "");
  const [selectedTags, setSelectedTags] = useState<string[]>(existingLog?.tags || []);
  const [newTag, setNewTag] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTag = newTag.trim();
    if (cleanTag && !selectedTags.includes(cleanTag)) {
      setSelectedTags((prev) => [...prev, cleanTag]);
      setNewTag("");
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const todayString = new Date().toISOString().split("T")[0];
      await onSave({
        date: existingLog?.date || todayString,
        mood,
        energy,
        sleep,
        physicalFeel,
        notes,
        tags: selectedTags,
      });
      onClose();
    } catch (err) {
      console.error("Save mood log failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h2 className="font-sans font-bold text-slate-800 tracking-tight">
              {existingLog ? "Edit Daily Wellness Entry" : "Daily Mindful Check-in"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Take a brief pause to evaluate your current state of being.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-750 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* 1. Core Mood Selector (Grid of beautiful cards) */}
          <div className="space-y-3">
            <label className="text-xs font-semibold tracking-wider text-slate-400 uppercase">How is your mood today?</label>
            <div className="grid grid-cols-5 gap-2">
              {MOODS.map((m) => {
                const MoodIcon = m.icon;
                const isSelected = mood === m.value;
                return (
                  <button
                    key={m.value}
                    onClick={() => setMood(m.value)}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer ${
                      isSelected 
                        ? `${m.color} scale-102 border-indigo-300 shadow-sm ring-1 ring-indigo-200/50`
                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-55 hover:text-slate-800 shadow-xs"
                    }`}
                  >
                    <MoodIcon className={`w-6 h-6 ${isSelected ? "stroke-2" : "opacity-85"}`} />
                    <span className="text-[10px] font-medium leading-none">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Sliders/Scales (Energy, Sleep, Physical) in unified grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Energy */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-xs font-medium flex items-center gap-1.5">
                  <Battery className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Energy</span>
                </span>
                <span className="text-xs font-mono font-bold text-indigo-600">{energy}/5</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="5" 
                value={energy} 
                onChange={(e) => setEnergy(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer h-1 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                <span>Drained</span>
                <span>Charged</span>
              </div>
            </div>

            {/* Sleep */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-xs font-medium flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-violet-600" />
                  <span>Sleep</span>
                </span>
                <span className="text-xs font-mono font-bold text-violet-600">{sleep}/5</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="5" 
                value={sleep} 
                onChange={(e) => setSleep(Number(e.target.value))}
                className="w-full accent-violet-600 cursor-pointer h-1 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                <span>Restless</span>
                <span>Restful</span>
              </div>
            </div>

            {/* Physical */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-xs font-medium flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Physical</span>
                </span>
                <span className="text-xs font-mono font-bold text-emerald-600">{physicalFeel}/5</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="5" 
                value={physicalFeel} 
                onChange={(e) => setPhysicalFeel(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer h-1 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                <span>Tense</span>
                <span>Relaxed</span>
              </div>
            </div>

          </div>

          {/* 3. Tags / Mood Triggers */}
          <div className="space-y-3">
            <label className="text-xs font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>Which factors are influencing you?</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-2.5 py-1 text-xs rounded-full border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                        : "bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 shadow-xs"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            {/* Custom Tag addition */}
            <form onSubmit={handleAddCustomTag} className="flex gap-2 max-w-xs mt-2">
              <input 
                type="text" 
                placeholder="Add custom trigger..." 
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="flex-1 bg-white border border-slate-200 text-slate-850 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-indigo-500 shadow-xs"
              />
              <button 
                type="submit"
                className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200/40 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* 4. Mini reflective notes */}
          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Reflective Notes (Optional)</label>
            <textarea
              placeholder="What's been happening? Jot down minor highlights, challenges, or thoughts..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-slate-850 text-sm focus:outline-none focus:border-indigo-500/80 leading-relaxed placeholder:text-slate-400 shadow-xs"
            />
          </div>

        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/10 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5 stroke-3" />
            )}
            <span>{existingLog ? "Save Changes" : "Log Check-in"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
