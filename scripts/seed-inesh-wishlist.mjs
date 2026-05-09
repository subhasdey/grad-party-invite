import { readFileSync } from "fs";

// Load env from .env.local (handles quoted multi-line values)
const raw = readFileSync("/Users/subhasdey/grad-party-invite/.env.local", "utf8");
const env = {};
const envRegex = /^([A-Z_][A-Z0-9_]*)=("(?:[^"\\]|\\.)*"|'[^']*'|[^\n]*)/gm;
let m;
while ((m = envRegex.exec(raw)) !== null) {
  const key = m[1];
  let val = m[2];
  if (val.startsWith('"') && val.endsWith('"')) {
    val = val.slice(1, -1).replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  } else if (val.startsWith("'") && val.endsWith("'")) {
    val = val.slice(1, -1);
  }
  env[key] = val;
}

const SHEET_ID = env.GOOGLE_SHEET_ID;
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SHEETS_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

function pemToBuffer(pem) {
  const b64 = pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const buf = Buffer.from(b64, "base64");
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}
function toBase64Url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}

async function getAccessToken() {
  const email = env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const pem = env.GOOGLE_PRIVATE_KEY_BASE64
    ? Buffer.from(env.GOOGLE_PRIVATE_KEY_BASE64, "base64").toString("utf8")
    : env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  const cryptoKey = await crypto.subtle.importKey("pkcs8", pemToBuffer(pem),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const now = Math.floor(Date.now() / 1000);
  const header  = toBase64Url(new TextEncoder().encode(JSON.stringify({ alg: "RS256", typ: "JWT" })));
  const payload = toBase64Url(new TextEncoder().encode(JSON.stringify({ iss: email, scope: "https://www.googleapis.com/auth/spreadsheets", aud: TOKEN_URL, exp: now+3600, iat: now })));
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, new TextEncoder().encode(`${header}.${payload}`));
  const jwt = `${header}.${payload}.${toBase64Url(sig)}`;
  const res = await fetch(TOKEN_URL, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }) });
  const data = await res.json();
  return data.access_token;
}

const ITEMS = [
  { person:"inesh", name:"Borealis Backpack", description:"The North Face backpack", price:"$99.00", url:"https://www.thenorthface.com/en-us/p/bags-and-gear/backpacks-224451/borealis-backpack-NF0A52SE?color=BI9&size=OS", category:"Accessories" },
  { person:"inesh", name:"GameSir G7 Pro Wired Controller", description:"Xbox Series X|S & PC controller, TMR sticks, Hall Effect triggers, 1000Hz, white", price:"$79.99", url:"https://www.amazon.com/GameSir-Controller-Wireless-Gamepad-PC-Triggers/dp/B0FD41XC3P", category:"Tech" },
  { person:"inesh", name:"LTT Ratcheting Screwdriver", description:"Black and Orange / Silver Shaft", price:"$69.99", url:"https://www.lttstore.com/products/screwdriver", category:"Tech" },
  { person:"inesh", name:"UNIQLO Wide Sweatpants (Gray)", description:"Small, 05 Gray", price:"$49.90", url:"https://www.uniqlo.com/us/en/products/E471809-000/00?colorDisplayCode=05&sizeDisplayCode=003", category:"Clothing" },
  { person:"inesh", name:"UNIQLO Wide Sweatpants (Black)", description:"Small, 09 Black", price:"$49.90", url:"https://www.uniqlo.com/us/en/products/E471809-000/00?colorDisplayCode=05&sizeDisplayCode=003", category:"Clothing" },
  { person:"inesh", name:"LTT Insulated Water Bottle 21oz", description:"Classic color", price:"$34.99", url:"https://www.lttstore.com/products/insulated-water-bottle?variant=41011167952999", category:"Home" },
  { person:"inesh", name:"LTT Scribedriver Mechanical Pencil", description:"Stainless / Brass", price:"$29.99", url:"https://www.lttstore.com/products/scribedriver-mechanical-pencil", category:"Other" },
  { person:"inesh", name:"Rotring 600 Mechanical Pencil 0.5mm", description:"Black, for writing, drafting, engineering", price:"$23.08", url:"https://www.amazon.com/Rotring-Mechanical-Pencil-Black-Professionals/dp/B00AZWYUA4/", category:"Other" },
  { person:"inesh", name:"Womier Matcha Keycaps Green", description:"PBT MOA, 5-side dye sublimation, Cherry/Gateron MX compatible", price:"$22.99", url:"https://www.amazon.com/Womier-Keyboard-Gradient-Sublimation-Keyboards/dp/B0DHMWP8SM/", category:"Tech" },
  { person:"inesh", name:"LEGO Speed Champions Mercedes-AMG F1 W15", description:"77244, ages 10+, gift for F1 fans", price:"$21.99", url:"https://www.amazon.com/LEGO-Speed-Champions-Mercedes-AMG-Race/dp/B0DHLHMK9V/", category:"Other" },
  { person:"inesh", name:"UGREEN Revodok Pro USB-C Hub 6-in-1", description:"10Gbps, 4K 60Hz HDMI, 100W PD, for MacBook/iPad/Rog Ally", price:"$15.99", url:"https://www.amazon.com/UGREEN-Revodok-Delivery-MacBook-Thinkpad/dp/B0D1XLNWP2/", category:"Tech" },
  { person:"inesh", name:"BESIGN LS03 Aluminum Laptop Stand", description:"Ergonomic detachable, 10-15.6 inch, silver", price:"$14.98", url:"https://www.amazon.com/BESIGN-Aluminum-Ergonomic-Detachable-Compatible/dp/B08BRCT4JH/", category:"Tech" },
  { person:"inesh", name:"Lenovo Laptop Bag T210", description:"Messenger shoulder bag, 15.6\" or 17\"", price:"$14.59", url:"https://www.amazon.com/dp/B075Y6Y9H5", category:"Accessories" },
  { person:"inesh", name:"uniball Kuru Toga Elite Mechanical Pencil", description:"0.5mm, HB #2, Gun Metal barrel", price:"$11.98", url:"https://www.amazon.com/Mechanical-Pencil-Starter-Silver-Barrel/dp/B089QV1VY9/", category:"Other" },
  { person:"inesh", name:"LTT Sticker Pack Set 3", description:"Other packs are fine too", price:"$9.99", url:"https://www.lttstore.com/products/sticker-pack-set-3", category:"Other" },
  { person:"inesh", name:"STAEDTLER Mars Plastic Vinyl Erasers (4-Pack)", description:"White, latex-free, minimal crumbling", price:"$4.86", url:"https://www.amazon.com/STAEDTLER-Plastic-Latex-free-Age-resistant-Crumbling/dp/B00006IFAN/", category:"Other" },
];

async function run() {
  const token = await getAccessToken();
  const now = new Date().toISOString();

  // Iris has 16 items in rows 1-16; Inesh starts at row 17
  const startRow = 17;
  console.log(`Writing Inesh items starting at row ${startRow}`);

  const values = ITEMS.map(item => [
    now, item.person, item.name, item.description || "", item.price || "",
    item.url || "", item.category || "", ""
  ]);

  const range = `Wishlist!A${startRow}:H${startRow + values.length - 1}`;
  const res = await fetch(
    `${SHEETS_BASE}/${SHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
    { method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ range, majorDimension: "ROWS", values }) }
  );
  const data = await res.json();
  console.log(`Written ${data.updatedRows ?? 0} rows. Status: ${res.status}`);
  console.log("Done! All 16 Inesh items loaded.");
}

run().catch(console.error);
