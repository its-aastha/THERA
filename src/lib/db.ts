import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  addDoc
} from "firebase/firestore";
import { db } from "./firebase";
import { UserProfile, MoodLog, JournalEntry, ChatMessage, GratitudeItem } from "../types";

// Fallback to localStorage if Firebase is unavailable or fails
const isLocalStorageAvailable = typeof window !== "undefined";

function getLocal<T>(key: string, defaultValue: T): T {
  if (!isLocalStorageAvailable) return defaultValue;
  const val = localStorage.getItem(key);
  if (!val) return defaultValue;
  try {
    return JSON.parse(val);
  } catch {
    return defaultValue;
  }
}

function setLocal<T>(key: string, value: T): void {
  if (!isLocalStorageAvailable) return;
  localStorage.setItem(key, JSON.stringify(value));
}

// 1. User Profile Operations
export async function saveProfile(userId: string, profile: UserProfile): Promise<void> {
  setLocal(`profile_${userId}`, profile);
  if (userId.startsWith("local_") || userId === "guest_user_123") {
    return;
  }
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, profile, { merge: true });
  } catch (error) {
    console.warn("Firestore saveProfile failed, using localStorage:", error);
  }
}

export async function getProfile(userId: string, email: string): Promise<UserProfile> {
  const localProfile = getLocal<UserProfile | null>(`profile_${userId}`, null);
  if (localProfile) return localProfile;

  const defaultProfile: UserProfile = {
    name: email.split("@")[0] || "Friend",
    email,
    primaryFocus: "stress relief",
    reminderTime: "21:00",
    notificationsEnabled: true,
    privacyMode: false,
    theme: "light",
  };

  if (userId.startsWith("local_") || userId === "guest_user_123") {
    return defaultProfile;
  }

  try {
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data() as UserProfile;
      setLocal(`profile_${userId}`, data);
      return data;
    }
  } catch (error) {
    console.warn("Firestore getProfile failed, using default:", error);
  }

  return defaultProfile;
}

// 2. Mood Log Operations
export async function saveMoodLog(userId: string, log: Omit<MoodLog, "id" | "userId"> & { id?: string; userId?: string }): Promise<MoodLog> {
  const id = log.id || `mood_${Date.now()}`;
  const fullLog: MoodLog = { ...log, id, userId };

  // Update local storage
  const localLogs = getLocal<MoodLog[]>(`moods_${userId}`, []);
  const filtered = localLogs.filter((m) => m.id !== id && m.date !== log.date); // avoid duplicates for same day or id
  const updated = [...filtered, fullLog];
  setLocal(`moods_${userId}`, updated);

  if (userId.startsWith("local_") || userId === "guest_user_123") {
    return fullLog;
  }

  try {
    const docRef = doc(db, "mood_logs", id);
    await setDoc(docRef, fullLog);
  } catch (error) {
    console.warn("Firestore saveMoodLog failed:", error);
  }

  return fullLog;
}

export async function getMoodLogs(userId: string): Promise<MoodLog[]> {
  if (userId.startsWith("local_") || userId === "guest_user_123") {
    return getLocal<MoodLog[]>(`moods_${userId}`, []);
  }
  try {
    const q = query(
      collection(db, "mood_logs"),
      where("userId", "==", userId),
      orderBy("date", "desc")
    );
    const snap = await getDocs(q);
    const logs: MoodLog[] = [];
    snap.forEach((d) => {
      logs.push(d.data() as MoodLog);
    });
    
    if (logs.length > 0) {
      setLocal(`moods_${userId}`, logs);
      return logs;
    }
  } catch (error) {
    console.warn("Firestore getMoodLogs failed, using local:", error);
  }

  return getLocal<MoodLog[]>(`moods_${userId}`, []);
}

// 3. AI Journal Entry Operations
export async function saveJournalEntry(userId: string, entry: Omit<JournalEntry, "id" | "userId"> & { id?: string; userId?: string }): Promise<JournalEntry> {
  const id = entry.id || `journal_${Date.now()}`;
  const fullEntry: JournalEntry = { ...entry, id, userId };

  const localEntries = getLocal<JournalEntry[]>(`journals_${userId}`, []);
  const updated = [fullEntry, ...localEntries.filter((j) => j.id !== id)];
  setLocal(`journals_${userId}`, updated);

  if (userId.startsWith("local_") || userId === "guest_user_123") {
    return fullEntry;
  }

  try {
    const docRef = doc(db, "journals", id);
    await setDoc(docRef, fullEntry);
  } catch (error) {
    console.warn("Firestore saveJournalEntry failed:", error);
  }

  return fullEntry;
}

export async function getJournalEntries(userId: string): Promise<JournalEntry[]> {
  if (userId.startsWith("local_") || userId === "guest_user_123") {
    return getLocal<JournalEntry[]>(`journals_${userId}`, []);
  }
  try {
    const q = query(
      collection(db, "journals"),
      where("userId", "==", userId),
      orderBy("date", "desc")
    );
    const snap = await getDocs(q);
    const entries: JournalEntry[] = [];
    snap.forEach((d) => {
      entries.push(d.data() as JournalEntry);
    });

    if (entries.length > 0) {
      setLocal(`journals_${userId}`, entries);
      return entries;
    }
  } catch (error) {
    console.warn("Firestore getJournalEntries failed, using local:", error);
  }

  return getLocal<JournalEntry[]>(`journals_${userId}`, []);
}

export async function deleteJournalEntry(userId: string, id: string): Promise<void> {
  const localEntries = getLocal<JournalEntry[]>(`journals_${userId}`, []);
  const updated = localEntries.filter((j) => j.id !== id);
  setLocal(`journals_${userId}`, updated);

  if (userId.startsWith("local_") || userId === "guest_user_123") {
    return;
  }

  try {
    const docRef = doc(db, "journals", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn("Firestore deleteJournalEntry failed:", error);
  }
}

// 4. Gratitude Item Operations
export async function saveGratitudeItem(userId: string, text: string, date: string): Promise<GratitudeItem> {
  const id = `gratitude_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const item: GratitudeItem = { id, userId, text, date };

  const localItems = getLocal<GratitudeItem[]>(`gratitude_${userId}`, []);
  setLocal(`gratitude_${userId}`, [item, ...localItems]);

  if (userId.startsWith("local_") || userId === "guest_user_123") {
    return item;
  }

  try {
    const docRef = doc(db, "gratitude", id);
    await setDoc(docRef, item);
  } catch (error) {
    console.warn("Firestore saveGratitudeItem failed:", error);
  }

  return item;
}

export async function getGratitudeItems(userId: string): Promise<GratitudeItem[]> {
  if (userId.startsWith("local_") || userId === "guest_user_123") {
    return getLocal<GratitudeItem[]>(`gratitude_${userId}`, []);
  }
  try {
    const q = query(
      collection(db, "gratitude"),
      where("userId", "==", userId),
      orderBy("date", "desc")
    );
    const snap = await getDocs(q);
    const items: GratitudeItem[] = [];
    snap.forEach((d) => {
      items.push(d.data() as GratitudeItem);
    });

    if (items.length > 0) {
      setLocal(`gratitude_${userId}`, items);
      return items;
    }
  } catch (error) {
    console.warn("Firestore getGratitudeItems failed, using local:", error);
  }

  return getLocal<GratitudeItem[]>(`gratitude_${userId}`, []);
}

// 5. Chat History (Conversation Memory) Operations
export async function saveChatHistory(userId: string, messages: ChatMessage[]): Promise<void> {
  setLocal(`chats_${userId}`, messages);
  
  if (userId.startsWith("local_") || userId === "guest_user_123") {
    return;
  }

  try {
    // To avoid storing dozens of subdocs for chat, we store the full thread in a single document
    const threadRef = doc(db, "chat_threads", userId);
    await setDoc(threadRef, { messages });
  } catch (error) {
    console.warn("Firestore saveChatHistory failed:", error);
  }
}

export async function getChatHistory(userId: string): Promise<ChatMessage[]> {
  if (userId.startsWith("local_") || userId === "guest_user_123") {
    return getLocal<ChatMessage[]>(`chats_${userId}`, []);
  }
  try {
    const threadRef = doc(db, "chat_threads", userId);
    const snap = await getDoc(threadRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data && Array.isArray(data.messages)) {
        setLocal(`chats_${userId}`, data.messages);
        return data.messages;
      }
    }
  } catch (error) {
    console.warn("Firestore getChatHistory failed, using local:", error);
  }

  return getLocal<ChatMessage[]>(`chats_${userId}`, []);
}
