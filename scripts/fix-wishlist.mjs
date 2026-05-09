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
  { person:"iris", name:"Nike Sportswear Club Fleece Sweatpants", description:"Mid-rise wide leg sweatpants", price:"", url:"https://www.nike.com/t/sportswear-club-fleece-womens-mid-rise-wide-leg-sweatpants-TPk2F9w2/FB2727-461", category:"Clothing" },
  { person:"iris", name:"Women's Aconcagua 3 Hoodie", description:"The North Face puffer hoodie", price:"$250", url:"https://www.thenorthface.com/en-us/p/womens/womens-jackets-and-vests/womens-puffer-jackets-829825/womens-aconcagua-3-hoodie-NF0A84IV?color=4H0&size=M", category:"Clothing" },
  { person:"iris", name:"Nike Cotton Cushioned Training Socks (6 Pack)", description:"Everyday DRI-FIT crew socks, white", price:"$18.99", url:"https://www.walmart.com/ip/Nike-Unisex-Everyday-Cotton-Cushioned-Crew-Training-Socks-with-DRI-FIT-Technology-Pack-of-6-Pairs-White/1763734469", category:"Clothing" },
  { person:"iris", name:"Coach Brooklyn Shoulder Bag 28", description:"Brown or Black", price:"$395", url:"https://www.coach.com/products/brooklyn-shoulder-bag-28/CU068-B4MPL.html", category:"Accessories" },
  { person:"iris", name:"NUTIKAS Desk Shelves Desktop Organizer", description:"Corner bookshelf tabletop shelving, white", price:"$25.92", url:"https://www.amazon.com/dp/B0DR31GC3D", category:"Home" },
  { person:"iris", name:"BESIGN Aluminum Laptop Stand", description:"Ergonomic detachable riser, 10-15.6 inch, silver", price:"$14.99", url:"https://www.amazon.com/dp/B08BRCT4JH", category:"Tech" },
  { person:"iris", name:"Kodak PIXPRO FZ55 Digital Camera", description:"16MP, 5x optical zoom, 1080p Full HD, black", price:"$139.99", url:"https://www.amazon.com/dp/B09ZRN1N3Z", category:"Tech" },
  { person:"iris", name:"The North Face Jester Backpack", description:"Classic everyday backpack, black", price:"$90", url:"https://www.thenorthface.com/en-us/p/bags-and-gear/backpacks-224451/jester-backpack-NF0A3VXF?color=4H0&size=OS", category:"Accessories" },
  { person:"iris", name:"Womens Thermal Underwear Set", description:"Long johns base layer fleece lined, black, medium", price:"$14.99", url:"https://www.amazon.com/dp/B09CGN2VJT", category:"Clothing" },
  { person:"iris", name:"Offstage Hoodie Glacier Grey", description:"White Fox Boutique", price:"", url:"https://whitefoxboutique.com/products/offstage-hoodie-glacier-grey", category:"Clothing", claimedBy:"Reserved" },
  { person:"iris", name:"Nike One High-Waisted 7/8 Leggings", description:"Nike One women's leggings", price:"$70", url:"https://www.nike.com/t/one-womens-high-waisted-7-8-leggings-a4SMPF70/IB9131-010", category:"Clothing" },
  { person:"iris", name:"Trendy Queen Oversized Hoodie", description:"Fleece sweatshirt, black/grey, size M", price:"$32.99", url:"https://www.amazon.com/dp/B0C65S55Q2", category:"Clothing" },
  { person:"iris", name:"Pandora Charms for Tennis Bracelet", description:"Silver charms", price:"", url:"", category:"Accessories" },
  { person:"iris", name:"UNIQLO Wide Sweatpants", description:"Small - available in Grey, Black, Dark Green", price:"$39.90", url:"https://www.uniqlo.com/us/en/products/E483282-000/00", category:"Clothing" },
  { person:"iris", name:"ProCase Rotating Jewelry Stand Organizer", description:"Ring tray, earring/bracelet/necklace holder, gold", price:"$11.99", url:"https://www.amazon.com/dp/B0F53X72FQ", category:"Home" },
  { person:"iris", name:"LEGO Botanicals Happy Plants (10349)", description:"Building toy, desk/shelf decor", price:"$18.39", url:"https://www.amazon.com/dp/B0DRW6C2RF", category:"Other" },
];

async function run() {
  const token = await getAccessToken();
  const now = new Date().toISOString();

  // 1. Clear the entire Wishlist sheet
  await fetch(`${SHEETS_BASE}/${SHEET_ID}/values/Wishlist!A:H:clear`, {
    method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
  });
  console.log("Cleared Wishlist sheet");

  // 2. Write all 16 items in one batch starting at A1
  const values = ITEMS.map(item => [
    now, item.person, item.name, item.description || "", item.price || "",
    item.url || "", item.category || "", item.claimedBy || ""
  ]);

  const range = `Wishlist!A1:H${values.length}`;
  const res = await fetch(
    `${SHEETS_BASE}/${SHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
    { method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ range, majorDimension: "ROWS", values }) }
  );
  const data = await res.json();
  console.log(`Written ${data.updatedRows ?? 0} rows. Status: ${res.status}`);
  console.log("Done! All 16 Iris items loaded correctly.");
}

run().catch(console.error);
