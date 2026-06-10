const TOKEN_URL = "https://oauth2.googleapis.com/token";
const DRIVE_BASE = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD = "https://www.googleapis.com/upload/drive/v3";
const SHEETS_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

function pemToBuffer(pem: string): ArrayBuffer {
  const b64 = pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

function toBase64Url(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function getAccessToken(): Promise<string> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const pem = process.env.GOOGLE_PRIVATE_KEY_BASE64
    ? Buffer.from(process.env.GOOGLE_PRIVATE_KEY_BASE64, "base64").toString("utf8")
    : process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!email || !pem) throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY");

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    pemToBuffer(pem),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const now = Math.floor(Date.now() / 1000);
  const header  = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" })).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
  const payload = btoa(JSON.stringify({ iss: email, scope: "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive", aud: TOKEN_URL, exp: now + 3600, iat: now })).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
  const signingInput = `${header}.${payload}`;
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, new TextEncoder().encode(signingInput));
  const jwt = `${signingInput}.${toBase64Url(sig)}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google service account auth failed (${res.status}): ${err}`);
  }
  const data = await res.json();
  if (!data.access_token) throw new Error("Service account auth failed: " + JSON.stringify(data));
  return data.access_token;
}

// ── Google Drive Upload ──────────────────────────────────────────────────────

export async function uploadToDrive(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<{ fileId: string; isVideo: boolean }> {
  const accessToken = await getAccessToken();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const isVideo = mimeType.startsWith("video/");

  const metadata: Record<string, unknown> = { name: filename };
  if (folderId) metadata.parents = [folderId];

  const initRes = await fetch(`${DRIVE_UPLOAD}/files?uploadType=resumable`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Type": mimeType,
      "X-Upload-Content-Length": String(buffer.length),
    },
    body: JSON.stringify(metadata),
  });
  if (!initRes.ok) {
    const err = await initRes.text();
    throw new Error(`Failed to initialize upload (${initRes.status}): ${err}`);
  }

  const uploadUrl = initRes.headers.get("Location");
  if (!uploadUrl) throw new Error("Failed to initiate resumable upload");

  const CHUNK = 10 * 1024 * 1024;
  let start = 0;
  let fileId = "";

  while (start < buffer.length) {
    const end = Math.min(start + CHUNK, buffer.length);
    const chunk = buffer.subarray(start, end);

    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Length": String(chunk.length),
        "Content-Range": `bytes ${start}-${end - 1}/${buffer.length}`,
        "Content-Type": mimeType,
      },
      body: new Uint8Array(chunk),
    });

    if (uploadRes.status === 200 || uploadRes.status === 201) {
      const data = await uploadRes.json();
      fileId = data.id;
    } else if (uploadRes.status !== 308) {
      const err = await uploadRes.text();
      throw new Error(`Upload failed (${uploadRes.status}): ${err}`);
    }

    start = end;
  }

  if (!fileId) throw new Error("Upload completed but no file ID returned");
  return { fileId, isVideo };
}

export async function streamFile(fileId: string, rangeHeader?: string | null): Promise<Response> {
  const accessToken = await getAccessToken();
  const headers: HeadersInit = { Authorization: `Bearer ${accessToken}` };
  if (rangeHeader) headers["Range"] = rangeHeader;
  return fetch(`${DRIVE_BASE}/files/${fileId}?alt=media`, { headers });
}

// ── RSVP Sheet ───────────────────────────────────────────────────────────────
// Columns: timestamp | name | email | phone | attending | adults | kids | diet | message | song | glutenFree | nutAllergy

export async function appendRsvpToSheet(input: {
  name: string;
  email?: string;
  phone?: string;
  attending: boolean;
  adults: number;
  kids: number;
  diet?: string;
  message?: string;
  song?: string;
  glutenFree?: boolean;
  nutAllergy?: boolean;
}): Promise<void> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error("Missing GOOGLE_SHEET_ID");

  const accessToken = await getAccessToken();
  const now = new Date().toISOString();
  const values = [[
    now,
    input.name,
    input.email || "",
    input.phone || "",
    input.attending ? "yes" : "no",
    String(input.adults),
    String(input.kids),
    input.diet || "",
    input.message || "",
    input.song || "",
    input.glutenFree ? "yes" : "no",
    input.nutAllergy ? "yes" : "no",
  ]];

  const res = await fetch(
    `${SHEETS_BASE}/${sheetId}/values/RSVP!A1:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ values }),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to append RSVP (${res.status}): ${err}`);
  }
}

export async function findRsvpRowByEmail(email: string): Promise<{ rowIndex: number; rsvp: Record<string, unknown> } | null> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId || !email) return null;
  const accessToken = await getAccessToken();
  const res = await fetch(`${SHEETS_BASE}/${sheetId}/values/RSVP!A:L`, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) return null;
  const data = await res.json();
  const rows: string[][] = data.values || [];
  // match by email; if no email stored on that row, skip it
  const idx = rows.findIndex(row => row[2]?.trim() && row[2].toLowerCase() === email.toLowerCase());
  if (idx === -1) return null;
  const row = rows[idx];
  return {
    rowIndex: idx + 1, // 1-based sheet row
    rsvp: { name: row[1], email: row[2], phone: row[3], attending: row[4] === "yes", adults: Number(row[5])||1, kids: Number(row[6])||0, diet: row[7]||"non-veg", message: row[8]||"", song: row[9]||"", glutenFree: row[10]==="yes", nutAllergy: row[11]==="yes" },
  };
}

export async function findRsvpRowByPhone(phone: string): Promise<{ rowIndex: number; rsvp: Record<string, unknown> } | null> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId || !phone) return null;
  const accessToken = await getAccessToken();
  const res = await fetch(`${SHEETS_BASE}/${sheetId}/values/RSVP!A:L`, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) return null;
  const data = await res.json();
  const rows: string[][] = data.values || [];
  const clean = (p: string) => p.replace(/\D/g, "");
  const idx = rows.findIndex(row => row[3] && clean(row[3]) === clean(phone));
  if (idx === -1) return null;
  const row = rows[idx];
  return {
    rowIndex: idx + 1,
    rsvp: { name: row[1], email: row[2], phone: row[3], attending: row[4] === "yes", adults: Number(row[5])||1, kids: Number(row[6])||0, diet: row[7]||"non-veg", message: row[8]||"", song: row[9]||"", glutenFree: row[10]==="yes", nutAllergy: row[11]==="yes" },
  };
}

export async function updateRsvpInSheet(rowIndex: number, input: {
  name: string; email?: string; phone?: string; attending: boolean;
  adults: number; kids: number; diet?: string; message?: string; song?: string;
  glutenFree?: boolean; nutAllergy?: boolean;
}): Promise<void> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error("Missing GOOGLE_SHEET_ID");
  const accessToken = await getAccessToken();
  const values = [[
    new Date().toISOString(), input.name, input.email||"", input.phone||"",
    input.attending ? "yes" : "no", String(input.adults), String(input.kids),
    input.diet||"", input.message||"", input.song||"",
    input.glutenFree ? "yes" : "no", input.nutAllergy ? "yes" : "no",
  ]];
  const range = `RSVP!A${rowIndex}:L${rowIndex}`;
  const res = await fetch(
    `${SHEETS_BASE}/${sheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
    { method: "PUT", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, body: JSON.stringify({ range, majorDimension: "ROWS", values }) }
  );
  if (!res.ok) { const err = await res.text(); throw new Error(`Failed to update RSVP (${res.status}): ${err}`); }
}

export async function readRsvpsFromSheet(): Promise<object[]> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) return [];

  const accessToken = await getAccessToken();
  const res = await fetch(
    `${SHEETS_BASE}/${sheetId}/values/RSVP!A:L`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  const rows: string[][] = data.values || [];

  return rows.map((row, i) => ({
    _id: String(i + 1),
    createdAt: row[0] || "",
    name: row[1] || "",
    email: row[2] || "",
    phone: row[3] || "",
    attending: row[4] === "yes",
    adults: Number(row[5]) || 1,
    kids: Number(row[6]) || 0,
    diet: row[7] || "non-veg",
    message: row[8] || "",
    song: row[9] || "",
    glutenFree: row[10] === "yes",
    nutAllergy: row[11] === "yes",
    reminderSent: false,
  })).reverse();
}

// ── Wishlist Sheet ────────────────────────────────────────────────────────────
// Columns: createdAt | person | name | description | price | url | category | claimedBy

export async function readWishlistFromSheet(): Promise<object[]> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) return [];
  const accessToken = await getAccessToken();
  const res = await fetch(`${SHEETS_BASE}/${sheetId}/values/Wishlist!A:H`, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) return [];
  const data = await res.json();
  const rows: string[][] = data.values || [];
  return rows.map((row, i) => ({
    _id: String(i + 1),
    createdAt: row[0] || "",
    person: row[1] || "both",
    name: row[2] || "",
    description: row[3] || "",
    price: row[4] || "",
    url: row[5] || "",
    category: row[6] || "",
    claimedBy: row[7] || "",
  }));
}

export async function appendWishlistItem(input: {
  person: string; name: string; description: string;
  price: string; url: string; category: string;
}): Promise<void> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error("Missing GOOGLE_SHEET_ID");
  const accessToken = await getAccessToken();
  const res = await fetch(
    `${SHEETS_BASE}/${sheetId}/values/Wishlist!A:H:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    { method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ values: [[new Date().toISOString(), input.person, input.name, input.description, input.price, input.url, input.category, ""]] }) }
  );
  if (!res.ok) { const err = await res.text(); throw new Error(`Failed to add wishlist item (${res.status}): ${err}`); }
}

export async function claimWishlistItem(rowIndex: number, claimedBy: string): Promise<void> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error("Missing GOOGLE_SHEET_ID");
  const accessToken = await getAccessToken();
  const range = `Wishlist!H${rowIndex}`;
  const res = await fetch(
    `${SHEETS_BASE}/${sheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
    { method: "PUT", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ range, majorDimension: "ROWS", values: [[claimedBy]] }) }
  );
  if (!res.ok) { const err = await res.text(); throw new Error(`Failed to claim item (${res.status}): ${err}`); }
}

export async function deleteWishlistItem(rowIndex: number): Promise<void> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error("Missing GOOGLE_SHEET_ID");
  const accessToken = await getAccessToken();
  // Clear the row
  const range = `Wishlist!A${rowIndex}:H${rowIndex}`;
  const res = await fetch(
    `${SHEETS_BASE}/${sheetId}/values/${encodeURIComponent(range)}:clear`,
    { method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" } }
  );
  if (!res.ok) { const err = await res.text(); throw new Error(`Failed to delete item (${res.status}): ${err}`); }
}

// ── Messages Sheet ────────────────────────────────────────────────────────────
// Columns: timestamp | name | text | avatar

export async function appendMessageToSheet(name: string, text: string, avatar?: string): Promise<void> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) return;

  const accessToken = await getAccessToken();
  const now = new Date().toISOString();

  const res = await fetch(
    `${SHEETS_BASE}/${sheetId}/values/Messages!A:D:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ values: [[now, name, text, avatar || "#7c3aed"]] }),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to append message (${res.status}): ${err}`);
  }
}

export async function readMessagesFromSheet(): Promise<object[]> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) return [];

  const accessToken = await getAccessToken();
  const res = await fetch(
    `${SHEETS_BASE}/${sheetId}/values/Messages!A:D`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  const rows: string[][] = data.values || [];

  return rows.map((row, i) => ({
    _id: String(i + 1),
    createdAt: row[0] || "",
    name: row[1] || "",
    text: row[2] || "",
    avatar: row[3] || "#7c3aed",
  }));
}

// ── Media Sheet ───────────────────────────────────────────────────────────────
// Columns: timestamp | name | url | fileId | type | caption | likes | email

export async function appendMediaToSheet(input: {
  name: string;
  url: string;
  fileId: string;
  type: "image" | "video";
  caption?: string;
  email?: string;
}): Promise<void> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error("Missing GOOGLE_SHEET_ID");

  const accessToken = await getAccessToken();
  const now = new Date().toISOString();

  const res = await fetch(
    `${SHEETS_BASE}/${sheetId}/values/Media!A:H:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ values: [[now, input.name, input.url, input.fileId, input.type, input.caption || "", "", input.email || ""]] }),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to append media (${res.status}): ${err}`);
  }
}

export async function likeMediaInSheet(rowIndex: number): Promise<number> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error("Missing GOOGLE_SHEET_ID");
  const accessToken = await getAccessToken();
  // Read current likes from column G
  const readRes = await fetch(`${SHEETS_BASE}/${sheetId}/values/Media!G${rowIndex}`, { headers: { Authorization: `Bearer ${accessToken}` } });
  const readData = readRes.ok ? await readRes.json() : {};
  const currentLikes = Number(readData.values?.[0]?.[0]) || 0;
  const newLikes = currentLikes + 1;
  const range = `Media!G${rowIndex}`;
  await fetch(
    `${SHEETS_BASE}/${sheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
    { method: "PUT", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ range, majorDimension: "ROWS", values: [[String(newLikes)]] }) }
  );
  return newLikes;
}

export async function updateMediaCaptionInSheet(rowIndex: number, caption: string): Promise<void> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error("Missing GOOGLE_SHEET_ID");
  const accessToken = await getAccessToken();
  const range = `Media!F${rowIndex}`;
  const res = await fetch(
    `${SHEETS_BASE}/${sheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
    { method: "PUT", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ range, majorDimension: "ROWS", values: [[caption]] }) }
  );
  if (!res.ok) { const err = await res.text(); throw new Error(`Failed to update caption (${res.status}): ${err}`); }
}

export async function updateMediaFileInSheet(rowIndex: number, url: string): Promise<void> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error("Missing GOOGLE_SHEET_ID");
  const accessToken = await getAccessToken();
  const range = `Media!C${rowIndex}:D${rowIndex}`;
  const res = await fetch(
    `${SHEETS_BASE}/${sheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
    { method: "PUT", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ range, majorDimension: "ROWS", values: [[url, url]] }) }
  );
  if (!res.ok) { const err = await res.text(); throw new Error(`Failed to update file (${res.status}): ${err}`); }
}

export async function deleteMediaFromSheet(rowIndex: number): Promise<void> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error("Missing GOOGLE_SHEET_ID");
  const accessToken = await getAccessToken();

  // Look up the numeric sheet id for "Media"
  const metaRes = await fetch(
    `${SHEETS_BASE}/${sheetId}?fields=sheets.properties`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const meta = await metaRes.json();
  const mediaSheet = meta.sheets?.find(
    (s: { properties: { title: string } }) => s.properties.title === "Media"
  );
  if (!mediaSheet) throw new Error("Media sheet not found");

  const res = await fetch(`${SHEETS_BASE}/${sheetId}:batchUpdate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      requests: [{
        deleteDimension: {
          range: {
            sheetId: mediaSheet.properties.sheetId,
            dimension: "ROWS",
            startIndex: rowIndex - 1, // 0-based
            endIndex: rowIndex,
          },
        },
      }],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to delete media row (${res.status}): ${err}`);
  }
}

export async function readMediaFromSheet(): Promise<object[]> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) return [];

  const accessToken = await getAccessToken();
  const res = await fetch(
    `${SHEETS_BASE}/${sheetId}/values/Media!A:H`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  const rows: string[][] = data.values || [];

  return rows.map((row, i) => ({
    _id: String(i + 1),
    createdAt: row[0] || "",
    name: row[1] || "",
    url: row[2] || "",
    publicId: row[3] || "",
    type: row[4] || "image",
    caption: row[5] || "",
    likes: Number(row[6]) || 0,
    email: row[7] || "",
  })).reverse();
}
