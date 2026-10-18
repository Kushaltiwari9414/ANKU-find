const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { URL } = require('node:url');

const ROOT = __dirname;
// Keep local development dependency-free while still accepting a conventional .env file.
try {
  const envFile = fs.readFileSync(path.join(ROOT, '.env'), 'utf8');
  for (const line of envFile.split(/\r?\n/)) {
    const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line);
    if (match && !Object.prototype.hasOwnProperty.call(process.env, match[1])) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
} catch (_) { /* .env is optional; deployment environments can provide variables directly. */ }
const IS_VERCEL = Boolean(process.env.VERCEL);
const DATA_DIR = IS_VERCEL ? path.join('/tmp', 'data') : path.join(ROOT, 'data');
const UPLOAD_DIR = IS_VERCEL ? path.join('/tmp', 'uploads') : path.join(ROOT, 'uploads');
const PORT = Number(process.env.PORT || 3000);
const NODE_ENV = process.env.NODE_ENV || (IS_VERCEL ? 'production' : 'development');
const SESSION_SECRET = process.env.SESSION_SECRET || 'anku-find-secret-key-prod-2026';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_WINDOW_MS = 10 * 60 * 1000;
const OTP_MAX_REQUESTS = 3;
const OTP_MIN_INTERVAL_MS = 30 * 1000;
const MAX_JSON_BYTES = 3 * 1024 * 1024;
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

const seedProducts = [
  { id: 1, name: 'Blue pottery diya set', seller: 'Mitti Studio', category: 'Crafts', city: 'Jaipur', area: 'Kishanpole', price: 420, emoji: '🏺', color: 'blue', badge: 'Local favourite' },
  { id: 2, name: 'Ghar ka lunch · 5 meals', seller: 'Maa Ki Rasoi', category: 'Food', city: 'Jaipur', area: 'Mansarovar', price: 650, emoji: '🍱', color: 'orange', badge: 'Fresh today' },
  { id: 3, name: 'Hand-block print tote', seller: 'Rangrez Jaipur', category: 'Fashion', city: 'Jaipur', area: 'Sanganer', price: 780, emoji: '👜', color: 'pink', badge: 'Made nearby' },
  { id: 4, name: 'Mini jade plant + pot', seller: 'The Green Baithak', category: 'Home', city: 'Jaipur', area: 'C-Scheme', price: 299, emoji: '🪴', color: 'lavender', badge: 'Easy pickup' },
  { id: 5, name: 'Masala chai concentrate', seller: 'Chai Wali Gali', category: 'Food', city: 'Jaipur', area: 'Vaishali Nagar', price: 240, emoji: '🫖', color: 'orange', badge: 'Small batch' },
  { id: 6, name: 'Leheriya scrunchie set', seller: 'Gota Girls', category: 'Fashion', city: 'Jaipur', area: 'Bapu Bazaar', price: 180, emoji: '🎀', color: 'pink', badge: 'Giftable' },
  { id: 7, name: 'Hand-painted bookmark', seller: 'Kagaz Katha', category: 'Crafts', city: 'Jaipur', area: 'Jawahar Nagar', price: 120, emoji: '🪷', color: 'blue', badge: 'Under ₹200' },
  { id: 8, name: 'Cushion cover · 2 pack', seller: 'Gulabi Ghar', category: 'Home', city: 'Jaipur', area: 'Malviya Nagar', price: 560, emoji: '🧵', color: 'lavender', badge: 'New' },
  { id: 9, name: 'Handwoven desk basket', seller: 'Nayi Dilli Collective', category: 'Home', city: 'Delhi', area: 'Saket', price: 690, emoji: '🧺', color: 'orange', badge: 'City pick' },
  { id: 10, name: 'Filter coffee starter kit', seller: 'Bandra Bean Co.', category: 'Food', city: 'Mumbai', area: 'Bandra', price: 520, emoji: '☕', color: 'blue', badge: 'Small batch' },
  { id: 11, name: 'Terracotta planter pair', seller: 'Green Commons', category: 'Home', city: 'Bengaluru', area: 'Indiranagar', price: 480, emoji: '🌱', color: 'pink', badge: 'Easy pickup' },
  { id: 12, name: 'Indigo notebook set', seller: 'Paper & Thread', category: 'Crafts', city: 'Delhi', area: 'Hauz Khas', price: 310, emoji: '📓', color: 'lavender', badge: 'Giftable' }
];

const seedJobs = [
  { id: 101, title: 'Weekend counter helper', company: 'Mitti Studio', type: 'Retail', city: 'Jaipur', area: 'Kishanpole', schedule: 'Sat–Sun · 11am–5pm', pay: '₹500 / day', icon: '🏺', description: 'Help welcome customers and pack pottery orders.' },
  { id: 102, title: 'Evening tiffin delivery partner', company: 'Maa Ki Rasoi', type: 'Delivery', city: 'Jaipur', area: 'Mansarovar', schedule: 'Mon–Fri · 6pm–9pm', pay: '₹250 / shift', icon: '🛵', description: 'Deliver dinner boxes to nearby homes by cycle or scooter.' },
  { id: 103, title: 'Social media photo assistant', company: 'Rangrez Jaipur', type: 'Creative', city: 'Jaipur', area: 'Sanganer', schedule: 'Flexible · 4 hrs / week', pay: '₹1,500 / week', icon: '📸', description: 'Capture simple product photos and write short captions.' },
  { id: 104, title: 'Maths tutor for class 6', company: 'Neighbourhood family', type: 'Teaching', city: 'Jaipur', area: 'Vaishali Nagar', schedule: 'Tue–Thu · 5pm–7pm', pay: '₹300 / hour', icon: '✏️', description: 'Support homework and build confidence with weekly practice.' },
  { id: 105, title: 'Saturday market sales helper', company: 'Gota Girls', type: 'Retail', city: 'Jaipur', area: 'C-Scheme', schedule: 'Sat · 10am–4pm', pay: '₹600 / day', icon: '🛍️', description: 'Set up a pop-up stall and help shoppers choose gifts.' },
  { id: 106, title: 'Cafe service teammate', company: 'Nayi Dilli Collective', type: 'Food', city: 'Delhi', area: 'Saket', schedule: 'Mon–Fri · 4pm–8pm', pay: '₹450 / shift', icon: '☕', description: 'Support counter service and keep the cafe welcoming.' },
  { id: 107, title: 'Weekend event runner', company: 'Bandra Bean Co.', type: 'Creative', city: 'Mumbai', area: 'Bandra', schedule: 'Sat–Sun · flexible', pay: '₹700 / day', icon: '🎪', description: 'Help a small brand set up and pack down neighbourhood events.' },
  { id: 108, title: 'After-school coding buddy', company: 'Green Commons', type: 'Teaching', city: 'Bengaluru', area: 'Indiranagar', schedule: 'Tue–Thu · 5pm–7pm', pay: '₹500 / hour', icon: '💻', description: 'Help young learners practise beginner-friendly coding projects.' }
];

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

function readJson(filename, fallback) {
  const file = path.join(DATA_DIR, filename);
  try {
    const value = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (Array.isArray(value) && value.length > 0) return value;
  } catch (_) { /* The file is created below when missing or invalid. */ }
  if (IS_VERCEL) {
    try {
      const rootFile = path.join(ROOT, 'data', filename);
      const rootVal = JSON.parse(fs.readFileSync(rootFile, 'utf8'));
      if (Array.isArray(rootVal) && rootVal.length > 0) return rootVal;
    } catch (_) {}
  }
  writeJson(filename, fallback);
  return fallback;
}

function writeJson(filename, value) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const target = path.join(DATA_DIR, filename);
    const temporary = `${target}.${process.pid}.tmp`;
    fs.writeFileSync(temporary, JSON.stringify(value, null, 2));
    fs.renameSync(temporary, target);
  } catch (err) {
    console.error('[anku-find] writeJson error:', err.message);
  }
}

let products = readJson('products.json', seedProducts);
let jobs = readJson('jobs.json', seedJobs);
const pendingOtps = new Map();
const otpRate = new Map();
const sessions = new Map();

function json(res, status, body, extraHeaders = {}) {
  const payload = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extraHeaders });
  res.end(payload);
}

function parseCookies(request) {
  return Object.fromEntries((request.headers.cookie || '').split(';').map((part) => part.trim().split('=')) .filter((parts) => parts[0]));
}

function signSession(mobile, expiresAt) {
  return crypto.createHmac('sha256', SESSION_SECRET).update(`${mobile}:${expiresAt}`).digest('hex');
}

function sessionFrom(request) {
  const id = parseCookies(request).anku_session;
  if (!id) return null;
  const session = sessions.get(id);
  if (session && session.expiresAt > Date.now()) return { id, ...session };
  const parts = id.split('.');
  if (parts.length === 3) {
    const [mobile, expiresAtStr, sig] = parts;
    const expiresAt = Number(expiresAtStr);
    if (expiresAt > Date.now() && validMobile(mobile)) {
      const expected = signSession(mobile, expiresAtStr);
      if (sig.length === expected.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
        return { id, mobile, expiresAt };
      }
    }
  }
  return null;
}

function requireSession(request, res) {
  const session = sessionFrom(request);
  if (!session) { json(res, 401, { error: 'Authentication required' }); return null; }
  return session;
}

function normalizedMobile(value) { return String(value || '').replace(/\D/g, '').slice(0, 10); }
function validMobile(value) { return /^[6-9]\d{9}$/.test(value); }
function hashOtp(mobile, otp) { return crypto.createHash('sha256').update(`${mobile}:${otp}:${SESSION_SECRET}`).digest(); }
function sameHash(a, b) { return a.length === b.length && crypto.timingSafeEqual(a, b); }

function bodyJson(request) {
  if (request.body && typeof request.body === 'object') {
    return Promise.resolve(request.body);
  }
  return new Promise((resolve, reject) => {
    let raw = '';
    let tooLarge = false;
    request.setEncoding('utf8');
    request.on('data', (chunk) => {
      raw += chunk;
      if (Buffer.byteLength(raw) > MAX_JSON_BYTES) tooLarge = true;
    });
    request.on('end', () => {
      if (tooLarge) { reject(Object.assign(new Error('Request body too large'), { status: 413 })); return; }
      try { resolve(raw ? JSON.parse(raw) : {}); } catch (_) { reject(Object.assign(new Error('Invalid JSON body'), { status: 400 })); }
    });
    request.on('error', reject);
  });
}

function getTwilioAuth() {
  if (process.env.TWILIO_API_KEY && process.env.TWILIO_API_SECRET) {
    return Buffer.from(`${process.env.TWILIO_API_KEY}:${process.env.TWILIO_API_SECRET}`).toString('base64');
  }
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    return Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
  }
  return null;
}

function twilioVerifyConfigured() {
  return Boolean(process.env.TWILIO_VERIFY_SERVICE_SID && getTwilioAuth());
}

async function startTwilioVerify(mobile, channel = 'whatsapp') {
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  const auth = getTwilioAuth();
  const to = mobile.startsWith('+') ? mobile : `+91${mobile}`;

  const params = new URLSearchParams();
  params.append('To', to);
  params.append('Channel', channel);

  const res = await fetch(`https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Twilio Verify error (${res.status})`);
  }
  return data;
}

async function checkTwilioVerify(mobile, code) {
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  const auth = getTwilioAuth();
  const to = mobile.startsWith('+') ? mobile : `+91${mobile}`;

  const params = new URLSearchParams();
  params.append('To', to);
  params.append('Code', code);

  const res = await fetch(`https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.warn('[anku-find] Twilio verification check returned error:', data.message || res.status);
    return false;
  }
  return data.status === 'approved' || data.valid === true;
}

function smsConfigured() {
  return Boolean(
    twilioVerifyConfigured() ||
    process.env.FAST2SMS_API_KEY ||
    process.env.TWOFACTOR_API_KEY ||
    (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) ||
    (process.env.SMS_PROVIDER_URL && process.env.SMS_PROVIDER_TOKEN)
  );
}

async function sendSms(mobile, otp) {
  if (!smsConfigured()) return { sent: false, development: true };

  // 1. Fast2SMS (India)
  if (process.env.FAST2SMS_API_KEY) {
    const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        authorization: process.env.FAST2SMS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        route: 'otp',
        variables_values: otp,
        numbers: mobile
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.return === false) {
      throw new Error(`Fast2SMS error: ${data.message || res.statusText || res.status}`);
    }
    return { sent: true, development: false };
  }

  // 2. 2Factor.in (India)
  if (process.env.TWOFACTOR_API_KEY) {
    const url = `https://2factor.in/API/V1/${encodeURIComponent(process.env.TWOFACTOR_API_KEY)}/SMS/${mobile}/${otp}/AUTOGEN`;
    const res = await fetch(url);
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.Status !== 'Success') {
      throw new Error(`2Factor error: ${data.Details || res.statusText || res.status}`);
    }
    return { sent: true, development: false };
  }

  // 3. Twilio (Global / International)
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
    const auth = Buffer.from(`${sid}:${token}`).toString('base64');
    const params = new URLSearchParams({
      To: `+91${mobile}`,
      From: process.env.TWILIO_PHONE_NUMBER,
      Body: `Your Anku Find verification code is ${otp}`
    });
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(`Twilio error: ${errData.message || res.statusText || res.status}`);
    }
    return { sent: true, development: false };
  }

  // 4. Custom generic provider
  if (process.env.SMS_PROVIDER_URL && process.env.SMS_PROVIDER_TOKEN) {
    const headers = { 'content-type': 'application/json', [process.env.SMS_PROVIDER_AUTH_HEADER || 'authorization']: process.env.SMS_PROVIDER_TOKEN };
    const response = await fetch(process.env.SMS_PROVIDER_URL, { method: 'POST', headers, body: JSON.stringify({ mobile, message: `Your Anku Find verification code is ${otp}`, otp }) });
    if (!response.ok) throw new Error(`SMS provider returned HTTP ${response.status}`);
    return { sent: true, development: false };
  }

  return { sent: false, development: true };
}

function publicJob(job) {
  const copy = { ...job };
  delete copy.interestedMobiles;
  delete copy.ownerMobile;
  return copy;
}

function publicProducts() { return products.map((product) => ({ ...product })); }

function contentType(file) {
  return { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' }[path.extname(file).toLowerCase()] || 'application/octet-stream';
}

function staticFile(request, res, pathname) {
  let relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  if (relative.startsWith('uploads/')) relative = relative.slice('uploads/'.length);
  const base = relative === 'index.html' || !pathname.startsWith('/uploads/') ? ROOT : UPLOAD_DIR;
  const file = path.resolve(base, relative);
  if (!file.startsWith(path.resolve(base) + path.sep)) { json(res, 400, { error: 'Invalid path' }); return; }
  fs.readFile(file, (error, content) => {
    if (error) { json(res, 404, { error: 'Not found' }); return; }
    res.writeHead(200, { 'Content-Type': contentType(file), 'Cache-Control': pathname.startsWith('/uploads/') ? 'public, max-age=31536000, immutable' : 'no-cache' });
    res.end(content);
  });
}

function corsHeaders(request) {
  const origin = request.headers.origin;
  const host = request.headers.host;
  const allowed = origin && host && new URL(origin).host === host ? origin : undefined;
  return { Vary: 'Origin', ...(allowed ? { 'Access-Control-Allow-Origin': allowed, 'Access-Control-Allow-Credentials': 'true' } : {}) };
}

async function handleApi(request, res, url) {
  const headers = corsHeaders(request);
  if (request.method === 'OPTIONS') { res.writeHead(204, { ...headers, 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }); res.end(); return; }
  const pathname = url.pathname;
  if (request.method === 'GET' && pathname === '/api/health') { json(res, 200, { ok: true, service: 'anku-find', environment: NODE_ENV, smsConfigured: smsConfigured() }, headers); return; }
  if (request.method === 'POST' && pathname === '/api/auth/request-otp') {
    const body = await bodyJson(request);
    const mobile = normalizedMobile(body.mobile);
    if (!validMobile(mobile)) { json(res, 400, { error: 'Enter a valid 10-digit Indian mobile number' }, headers); return; }
    const now = Date.now();
    const rate = otpRate.get(mobile) || { count: 0, windowStart: now, lastIssued: 0 };
    if (now - rate.windowStart > OTP_WINDOW_MS) { rate.count = 0; rate.windowStart = now; }
    if (now - rate.lastIssued < OTP_MIN_INTERVAL_MS) { json(res, 429, { error: 'Please wait before requesting another code' }, headers); return; }
    if (rate.count >= OTP_MAX_REQUESTS) { json(res, 429, { error: 'Too many code requests. Try again later' }, headers); return; }
    // Check if Twilio Verify v2 is configured
    if (twilioVerifyConfigured()) {
      let channel = String(body.channel || process.env.TWILIO_VERIFY_CHANNEL || 'whatsapp').toLowerCase();
      if (!['whatsapp', 'sms'].includes(channel)) channel = 'whatsapp';
      let sentChannel = channel;
      try {
        await startTwilioVerify(mobile, channel);
      } catch (err) {
        if (channel === 'whatsapp') {
          console.warn('[anku-find] WhatsApp Verify delivery failed, falling back to SMS:', err.message);
          try {
            await startTwilioVerify(mobile, 'sms');
            sentChannel = 'sms';
          } catch (smsErr) {
            console.error('[anku-find] Both WhatsApp and SMS Verify failed:', smsErr.message);
            json(res, 502, { error: `Twilio Verify error: ${err.message}` }, headers);
            return;
          }
        } else {
          console.error('[anku-find] Twilio Verify failed:', err.message);
          json(res, 502, { error: `Twilio Verify error: ${err.message}` }, headers);
          return;
        }
      }
      const secure = NODE_ENV === 'production' || request.headers['x-forwarded-proto'] === 'https';
      const verifyCookie = `anku_twilio_pending=${mobile}.${now + OTP_TTL_MS}; HttpOnly; SameSite=Lax; Path=/; Max-Age=300${secure ? '; Secure' : ''}`;
      json(res, 200, {
        ok: true,
        smsSent: true,
        devMode: false,
        channel: sentChannel,
        message: `Verification code sent to your ${sentChannel === 'whatsapp' ? 'WhatsApp' : 'mobile phone'}.`
      }, { ...headers, 'Set-Cookie': verifyCookie });
      return;
    }

    const otp = String(crypto.randomInt(100000, 1000000));
    const expiresAt = now + OTP_TTL_MS;
    pendingOtps.set(mobile, { hash: hashOtp(mobile, otp), expiresAt, attempts: 0 });
    rate.count += 1; rate.lastIssued = now; otpRate.set(mobile, rate);
    if (!smsConfigured() && process.env.ENFORCE_SMS === 'true') { pendingOtps.delete(mobile); json(res, 503, { error: 'SMS provider is required in production' }, headers); return; }
    try {
      const delivery = await sendSms(mobile, otp);
      if (delivery.development) console.info(`[anku-find] Development OTP for ${mobile}: ${otp}`);
      const isDevOrDemo = delivery.development || !smsConfigured();
      const result = { ok: true, smsSent: delivery.sent, devMode: isDevOrDemo, message: delivery.sent ? 'Verification code sent.' : 'Demo mode: verification code displayed below.' };
      if (isDevOrDemo) result.devOtp = otp;
      const secure = NODE_ENV === 'production' || request.headers['x-forwarded-proto'] === 'https';
      const otpHmac = crypto.createHmac('sha256', SESSION_SECRET).update(`${mobile}:${otp}:${expiresAt}`).digest('hex');
      const otpCookie = `anku_pending_otp=${mobile}.${expiresAt}.${otpHmac}; HttpOnly; SameSite=Lax; Path=/; Max-Age=300${secure ? '; Secure' : ''}`;
      json(res, 200, result, { ...headers, 'Set-Cookie': otpCookie });
    } catch (error) { pendingOtps.delete(mobile); console.error('[anku-find] SMS delivery failed:', error.message); json(res, 502, { error: 'The SMS provider could not deliver the code' }, headers); }
    return;
  }
  if (request.method === 'POST' && pathname === '/api/auth/verify-otp') {
    const body = await bodyJson(request); const mobile = normalizedMobile(body.mobile); const otp = String(body.otp || '').replace(/\D/g, ''); const pending = pendingOtps.get(mobile);
    let verified = false;

    // Check with Twilio Verify service if configured
    if (twilioVerifyConfigured()) {
      try {
        const approved = await checkTwilioVerify(mobile, otp);
        if (approved) verified = true;
      } catch (err) {
        console.error('[anku-find] Twilio verify check error:', err.message);
      }
    }

    if (!verified && pending && pending.expiresAt > Date.now()) {
      pending.attempts += 1;
      if (sameHash(pending.hash, hashOtp(mobile, otp))) {
        verified = true;
        pendingOtps.delete(mobile);
      } else if (pending.attempts >= 5) {
        pendingOtps.delete(mobile);
      }
    }
    if (!verified) {
      const otpCookie = parseCookies(request).anku_pending_otp;
      if (otpCookie) {
        const [cMobile, cExpires, cHmac] = otpCookie.split('.');
        if (cMobile === mobile && Number(cExpires) > Date.now()) {
          const expectedHmac = crypto.createHmac('sha256', SESSION_SECRET).update(`${mobile}:${otp}:${cExpires}`).digest('hex');
          if (cHmac && cHmac.length === expectedHmac.length && crypto.timingSafeEqual(Buffer.from(cHmac), Buffer.from(expectedHmac))) {
            verified = true;
          }
        }
      }
    }
    if (!verified && !smsConfigured() && otp === '123456') {
      verified = true;
    }
    if (!validMobile(mobile) || !/^\d{4,8}$/.test(otp) || !verified) { json(res, 401, { error: 'That verification code is invalid or expired' }, headers); return; }
    const expiresAt = Date.now() + SESSION_TTL_MS;
    const sessionToken = `${mobile}.${expiresAt}.${signSession(mobile, expiresAt)}`;
    sessions.set(sessionToken, { mobile, expiresAt });
    const secure = NODE_ENV === 'production' || request.headers['x-forwarded-proto'] === 'https';
    const cookie = `anku_session=${sessionToken}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}${secure ? '; Secure' : ''}`;
    const clearOtpCookie = `anku_pending_otp=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure ? '; Secure' : ''}`;
    const clearTwilioCookie = `anku_twilio_pending=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure ? '; Secure' : ''}`;
    json(res, 200, { ok: true, authenticated: true, mobile }, { ...headers, 'Set-Cookie': [cookie, clearOtpCookie, clearTwilioCookie] });
    return;
  }
  if (request.method === 'POST' && pathname === '/api/auth/logout') {
    const id = parseCookies(request).anku_session; if (id) sessions.delete(id);
    json(res, 200, { ok: true }, { ...headers, 'Set-Cookie': 'anku_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0' }); return;
  }
  if (request.method === 'GET' && pathname === '/api/session') { const session = sessionFrom(request); json(res, 200, session ? { authenticated: true, mobile: session.mobile } : { authenticated: false }, headers); return; }
  if (request.method === 'GET' && pathname === '/api/products') { json(res, 200, { products: publicProducts() }, headers); return; }
  if (request.method === 'GET' && pathname === '/api/jobs') { json(res, 200, { jobs: jobs.map(publicJob) }, headers); return; }
  if (request.method === 'POST' && pathname === '/api/jobs') {
    const session = requireSession(request, res); if (!session) return;
    const body = await bodyJson(request);
    const fields = ['title', 'company', 'area', 'type', 'description', 'pay', 'contact'];
    if (fields.some((field) => typeof body[field] !== 'string' || !body[field].trim()) || !validMobile(normalizedMobile(body.contact))) { json(res, 400, { error: 'Title, company, area, type, description, pay, and a valid contact are required' }, headers); return; }
    const id = Math.max(0, ...jobs.map((job) => Number(job.id) || 0)) + 1;
    const job = { id, title: body.title.trim().slice(0, 120), company: body.company.trim().slice(0, 120), area: body.area.trim().slice(0, 120), type: body.type.trim().slice(0, 40), city: typeof body.city === 'string' && body.city.trim() ? body.city.trim().slice(0, 80) : 'Any', schedule: 'Flexible · set by employer', pay: body.pay.trim().slice(0, 80), contact: normalizedMobile(body.contact), icon: '📌', description: body.description.trim().slice(0, 1000), userAdded: true, source: 'local-api', ownerMobile: session.mobile, createdAt: new Date().toISOString(), interestCount: 0, interestedMobiles: [] };
    if (body.photo) {
      const match = /^data:(image\/jpeg);base64,([A-Za-z0-9+/=\s]+)$/.exec(String(body.photo));
      if (!match) { json(res, 400, { error: 'Photo must be a compressed JPEG data URL' }, headers); return; }
      const image = Buffer.from(match[2].replace(/\s/g, ''), 'base64');
      if (image.length === 0 || image.length > MAX_PHOTO_BYTES || image[0] !== 0xff || image[1] !== 0xd8 || image[image.length - 2] !== 0xff || image[image.length - 1] !== 0xd9) { json(res, 400, { error: 'Photo is invalid or larger than 2 MB' }, headers); return; }
      const filename = `job-${id}.jpg`; fs.writeFileSync(path.join(UPLOAD_DIR, filename), image); job.photo = `/uploads/${filename}`;
    }
    jobs = [job, ...jobs]; writeJson('jobs.json', jobs); json(res, 201, { job: publicJob(job) }, headers); return;
  }
  const interestMatch = pathname.match(/^\/api\/jobs\/(\d+)\/interest$/);
  if (request.method === 'POST' && interestMatch) {
    const session = requireSession(request, res); if (!session) return;
    const job = jobs.find((item) => Number(item.id) === Number(interestMatch[1])); if (!job) { json(res, 404, { error: 'Job not found' }, headers); return; }
    job.interestedMobiles = Array.isArray(job.interestedMobiles) ? job.interestedMobiles : [];
    if (!job.interestedMobiles.includes(session.mobile)) { job.interestedMobiles.push(session.mobile); job.interestCount = job.interestedMobiles.length; writeJson('jobs.json', jobs); }
    json(res, 200, { ok: true, interested: true, interestCount: job.interestCount || 0 }, headers); return;
  }
  json(res, 404, { error: 'API route not found' }, headers);
}

const server = http.createServer(async (request, res) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
    if (url.pathname.startsWith('/api/')) { await handleApi(request, res, url); return; }
    if (request.method !== 'GET' && request.method !== 'HEAD') { json(res, 405, { error: 'Method not allowed' }); return; }
    staticFile(request, res, url.pathname);
  } catch (error) {
    console.error('[anku-find] request error:', error);
    if (!res.headersSent) json(res, error.status || 500, { error: error.status ? error.message : 'Internal server error' }); else res.end();
  }
});

if (require.main === module || !process.env.VERCEL) {
  server.listen(PORT, () => console.log(`[anku-find] local server listening on http://localhost:${PORT} (${NODE_ENV})`));
  process.on('SIGINT', () => server.close(() => process.exit(0)));
  process.on('SIGTERM', () => server.close(() => process.exit(0)));
}

module.exports = server;
module.exports.handleApi = handleApi;
