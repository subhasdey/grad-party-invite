import mongoose, { Schema, models } from "mongoose";

// ── RSVP ──
const rsvpSchema = new Schema({
  name:          { type: String, required: true },
  email:         { type: String, required: true },
  phone:         String,
  adults:        { type: Number, default: 1 },
  kids:          { type: Number, default: 0 },
  diet:          { type: String, enum: ["veg", "non-veg", "both"], default: "non-veg" },
  message:       String,
  attending:     { type: Boolean, default: true },
  song:          String,
  reminderSent:  { type: Boolean, default: false },
}, { timestamps: true });

// ── Chat Message ──
const messageSchema = new Schema({
  name:   { type: String, required: true },
  text:   { type: String, required: true },
  avatar: { type: String, default: "#7c3aed" },
}, { timestamps: true });

// ── Media ──
const mediaSchema = new Schema({
  name:      { type: String, required: true },
  url:       { type: String, required: true },
  publicId:  String,
  type:      { type: String, enum: ["image", "video"], required: true },
  caption:   String,
  thumbnail: String,
}, { timestamps: true });

export const RSVP    = models.RSVP    || mongoose.model("RSVP",    rsvpSchema);
export const Message = models.Message || mongoose.model("Message", messageSchema);
export const Media   = models.Media   || mongoose.model("Media",   mediaSchema);
