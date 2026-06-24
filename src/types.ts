export interface UserProfile {
  name: string;
  email: string;
  primaryFocus: string;
  reminderTime: string;
  notificationsEnabled: boolean;
  privacyMode: boolean;
  theme?: "light" | "dark" | "high-contrast";
}

export interface Emotions {
  calm: number;
  joy: number;
  anxiety: number;
  sadness: number;
  anger: number;
  overwhelm: number;
}

export interface JournalAnalysis {
  reflection: string;
  emotions: Emotions;
  gratitudeItems: string[];
  crisisLevel: "safe" | "low" | "medium" | "high";
  cognitiveTriggers: string[];
  crisisDetected?: boolean;
}

export interface JournalEntry {
  id: string;
  userId: string;
  content: string;
  date: string;
  analysis?: JournalAnalysis;
}

export interface ChatMessage {
  id: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  detectedEmotions?: Emotions;
  suggestions?: string[];
  crisisDetected?: boolean;
}

export interface MoodLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mood: number; // 1 (awful) to 5 (excellent)
  energy: number; // 1 to 5
  sleep: number; // 1 to 5 (poor to excellent)
  physicalFeel: number; // 1 to 5
  notes: string;
  tags: string[];
}

export interface GratitudeItem {
  id: string;
  userId: string;
  text: string;
  date: string; // YYYY-MM-DD
}
