import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const DATA_DIR = path.join(process.cwd(), "data");
const RSVPS_FILE = path.join(DATA_DIR, "rsvps.json");
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");
const MEDIA_FILE = path.join(DATA_DIR, "media.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJSON<T>(file: string, fallback: T): T {
  ensureDataDir();
  if (!fs.existsSync(file)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    return fallback;
  }
}

function writeJSON(file: string, data: unknown) {
  ensureDataDir();
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

export interface RSVP {
  id: string;
  name: string;
  email: string;
  phone: string;
  adults: number;
  kids: number;
  diet: "veg" | "non-veg" | "both";
  message?: string;
  attending: boolean;
  createdAt: string;
  reminderSent: boolean;
}

export interface ChatMessage {
  id: string;
  name: string;
  text: string;
  createdAt: string;
  avatar: string;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: "image" | "video";
  caption?: string;
  createdAt: string;
}

// RSVP operations
export function getRSVPs(): RSVP[] {
  return readJSON<RSVP[]>(RSVPS_FILE, []);
}

export function addRSVP(data: Omit<RSVP, "id" | "createdAt" | "reminderSent">): RSVP {
  const rsvps = getRSVPs();
  const rsvp: RSVP = {
    ...data,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    reminderSent: false,
  };
  rsvps.push(rsvp);
  writeJSON(RSVPS_FILE, rsvps);
  return rsvp;
}

export function markReminderSent(id: string) {
  const rsvps = getRSVPs();
  const idx = rsvps.findIndex((r) => r.id === id);
  if (idx !== -1) {
    rsvps[idx].reminderSent = true;
    writeJSON(RSVPS_FILE, rsvps);
  }
}

// Chat operations
export function getMessages(): ChatMessage[] {
  return readJSON<ChatMessage[]>(MESSAGES_FILE, []);
}

export function addMessage(data: Omit<ChatMessage, "id" | "createdAt">): ChatMessage {
  const messages = getMessages();
  const msg: ChatMessage = {
    ...data,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  messages.push(msg);
  if (messages.length > 200) messages.splice(0, messages.length - 200);
  writeJSON(MESSAGES_FILE, messages);
  return msg;
}

// Media operations
export function getMedia(): MediaItem[] {
  return readJSON<MediaItem[]>(MEDIA_FILE, []);
}

export function addMedia(data: Omit<MediaItem, "id" | "createdAt">): MediaItem {
  const media = getMedia();
  const item: MediaItem = {
    ...data,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  media.push(item);
  writeJSON(MEDIA_FILE, media);
  return item;
}
