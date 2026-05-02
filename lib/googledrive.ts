const TOKEN_URL = "https://oauth2.googleapis.com/token";
const DRIVE_BASE = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD = "https://www.googleapis.com/upload/drive/v3";
const SHEETS_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

function requireGoogleAuthEnv() {
  if (!process.env.GOOGLE_CLIENT_ID) throw new Error("Missing GOOGLE_CLIENT_ID");
  if (!process.env.GOOGLE_CLIENT_SECRET) throw new Error("Missing GOOGLE_CLIENT_SECRET");
  if (!process.env.GOOGLE_REFRESH_TOKEN) throw new Error("Missing GOOGLE_REFRESH_TOKEN");
}

async function getAccessToken(): Promise<string> {
  requireGoogleAuthEnv();
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google auth failed (${res.status}): ${err}`);
  }
  const data = await res.json();
  if (!data.access_token) throw new Error("Google auth failed: " + JSON.stringify(data));
  return data.access_token;
}

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

  // Initiate resumable upload
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

  // Upload in chunks (handles large videos)
  const CHUNK = 10 * 1024 * 1024; // 10MB
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

export async function appendMessageToSheet(name: string, text: string): Promise<void> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) return;

  const accessToken = await getAccessToken();
  const now = new Date().toISOString();

  const res = await fetch(
    `${SHEETS_BASE}/${sheetId}/values/Sheet1!A:C:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: [[now, name, text]] }),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to append to sheet (${res.status}): ${err}`);
  }
}
