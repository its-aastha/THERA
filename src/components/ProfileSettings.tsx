import React, { useState } from "react";
import { UserProfile } from "../types";
import { Settings, User, Bell, Shield, Database, Check, AlertTriangle, Info, Palette, Sun, Moon, Eye } from "lucide-react";

interface ProfileSettingsProps {
  profile: UserProfile;
  onSave: (updatedProfile: UserProfile) => Promise<void>;
  onClearAllData: () => Promise<void>;
}

const FOCUS_AREAS = [
  "General Stress & Anxiety Relief",
  "Overcoming Negative Cognitive Patterns",
  "Improving Sleep Hygiene",
  "Cultivating Gratitude & Joy",
  "Building Better Relationships",
  "Grief and Trauma Healing"
];

export default function ProfileSettings({ profile, onSave, onClearAllData }: ProfileSettingsProps) {
  const [name, setName] = useState(profile.name || "");
  const [primaryFocus, setPrimaryFocus] = useState(profile.primaryFocus || FOCUS_AREAS[0]);
  const [reminderTime, setReminderTime] = useState(profile.reminderTime || "21:00");
  const [notificationsEnabled, setNotificationsEnabled] = useState(profile.notificationsEnabled ?? true);
  const [privacyMode, setPrivacyMode] = useState(profile.privacyMode ?? false);
  const [theme, setTheme] = useState<"light" | "dark" | "high-contrast">(profile.theme || "light");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg("");

    try {
      await onSave({
        ...profile,
        name,
        primaryFocus,
        reminderTime,
        notificationsEnabled,
        privacyMode,
        theme,
      });
      setSuccessMsg("Profile and settings updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Save settings error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearAllConfirm = async () => {
    setShowClearConfirm(false);
    await onClearAllData();
  };

  return (
    <div className="w-full space-y-8 p-1 font-sans">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-600" />
          <span>Profile & Privacy Settings</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">Manage your identity, focus targets, notification curves, and personal privacy modes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main Form Settings (8 cols) */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {successMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 font-medium leading-relaxed flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* 1. Identity Segment */}
            <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <User className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800">Your Profile</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">Preferred Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">Registered Email</label>
                  <input
                    type="email"
                    disabled
                    value={profile.email}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-400 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">Primary Focus Area</label>
                <select
                  value={primaryFocus}
                  onChange={(e) => setPrimaryFocus(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-xs"
                >
                  {FOCUS_AREAS.map((item) => (
                    <option key={item} value={item} className="bg-white text-slate-800">
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 2. Notifications & Reminders */}
            <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <Bell className="w-4 h-4 text-violet-600" />
                <h3 className="text-sm font-bold text-slate-800">Mindfulness Reminders</h3>
              </div>

              <div className="flex items-center justify-between py-1">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-slate-800">Daily Reflection Prompts</span>
                  <p className="text-slate-500 text-[10px]">Send local notification cues when it's time to check-in.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setNotificationsEnabled(checked);
                    if (checked && "Notification" in window && Notification.permission !== "granted") {
                      Notification.requestPermission();
                    }
                  }}
                  className="w-4 h-4 accent-indigo-600 cursor-pointer"
                />
              </div>

              {notificationsEnabled && (
                <div className="flex flex-col sm:flex-row sm:items-end gap-4 animate-in fade-in duration-150">
                  <div className="space-y-1.5 flex-1">
                    <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">Target Time</label>
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if ("Notification" in window && Notification.permission !== "granted") {
                        Notification.requestPermission();
                      }
                      const event = new CustomEvent("trigger-breathing-reminder");
                      window.dispatchEvent(event);
                    }}
                    className="py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 shrink-0 transition-colors h-[42px] mt-1 sm:mt-0"
                  >
                    <Bell className="w-3.5 h-3.5 text-slate-500" />
                    <span>Send Test Reminder</span>
                  </button>
                </div>
              )}
            </div>

            {/* 3. Security & Privacy Toggle */}
            <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <Shield className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-800">Sanctuary Privacy Protection</h3>
              </div>

              <div className="flex items-center justify-between py-1">
                <div className="space-y-0.5 pr-4">
                  <span className="text-xs font-semibold text-slate-800">Strict Cover Mode (Hide preview lines)</span>
                  <p className="text-slate-500 text-[10px]">Hides raw journal text on the history listing until fully expanded, preventing shoulder surfing.</p>
                </div>
                <input
                  type="checkbox"
                  checked={privacyMode}
                  onChange={(e) => setPrivacyMode(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-505 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-indigo-600/10 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="w-4 h-4 stroke-3" />
                )}
                <span>Save All Settings</span>
              </button>
            </div>

          </form>
        </div>

        {/* Danger Data Sovereignty Zone (4 cols) */}
        <div className="lg:col-span-4 p-5 bg-white border border-slate-200 rounded-2xl space-y-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-800">
            <Database className="w-4.5 h-4.5 text-red-600" />
            <h3 className="font-sans font-bold text-xs tracking-wider uppercase">Data Sovereignty</h3>
          </div>
          
          <p className="text-xs text-slate-500 leading-relaxed">
            In compliance with patient confidentiality frameworks, we provide complete, non-recoverable wiping of all persistent states.
          </p>

          <div className="pt-2 border-t border-slate-100 space-y-4">
            {!showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="w-full py-2.5 text-xs text-red-600 hover:text-red-700 font-semibold bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors cursor-pointer text-center"
              >
                Permanently Wipe THERA Logs
              </button>
            ) : (
              <div className="p-3.5 bg-red-55 border border-red-100 rounded-xl space-y-3.5">
                <div className="flex gap-2 text-xs text-red-700">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <p className="font-medium">Are you absolutely sure? All journals, chats, and moods will be deleted forever.</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="py-1.5 text-xs font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    No, Cancel
                  </button>
                  <button
                    onClick={handleClearAllConfirm}
                    className="py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-750 rounded-lg transition-colors cursor-pointer"
                  >
                    Yes, Wipe Data
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-[11px] text-slate-500 shadow-xs">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <Info className="w-3.5 h-3.5 text-indigo-600" />
              <span>Hosting Detail</span>
            </div>
            <p className="leading-relaxed text-slate-500">
              Your profile values are cached client-side and saved into secure sandboxed collections on Google Cloud Platform's Firestore.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
