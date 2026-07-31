const crypto = require("crypto");

const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGRsYW5zcGpxZXd5cXVydnZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzAwNzU4NywiZXhwIjoyMDk4NTgzNTg3fQ.ceNGd33pb6qo5F4QcjuISIGwRzdeTwjGDSnw0HKP1_o";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGRsYW5zcGpxZXd5cXVydnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMDc1ODcsImV4cCI6MjA5ODU4MzU4N30.IiDDORIdoN74WqlJAt4ni4OJyKq2S50Jh24rxBwcW5I";
const SUPABASE_URL = "https://zrxdlanspjqewyqurvvl.supabase.co";

function generateRandomString(length) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += possible[bytes[i] % possible.length];
  }
  return result;
}

function sha256(plain) {
  return crypto.createHash('sha256').update(plain).digest();
}

function base64urlencode(buffer) {
  return buffer.toString('base64')
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function run() {
  const verifier = generateRandomString(64);
  const challenge = base64urlencode(sha256(verifier));
  const state = generateRandomString(16);

  console.log("1. Requesting magic link...");
  const linkResp = await fetch(`${SUPABASE_URL}/auth/v1/admin/generate_link`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SERVICE_ROLE_KEY,
      "Authorization": `Bearer ${SERVICE_ROLE_KEY}`
    },
    body: JSON.stringify({
      type: "magiclink",
      email: "akshanshkhairwar@gmail.com"
    })
  });

  if (!linkResp.ok) {
    throw new Error("Failed to generate link: " + await linkResp.text());
  }

  const linkData = await linkResp.json();
  const hashedToken = linkData.hashed_token;

  console.log("2. Verifying link...");
  const verifyResp = await fetch(`${SUPABASE_URL}/auth/v1/verify?token=${hashedToken}&type=magiclink&redirect_to=https://identity.aarcsx.com`, {
    method: "GET",
    headers: {
      "apikey": ANON_KEY
    },
    redirect: "manual"
  });

  const location = verifyResp.headers.get("location");
  if (!location) {
    throw new Error("Verification failed to redirect");
  }

  const hashIndex = location.indexOf("#");
  const hashParams = new URLSearchParams(location.substring(hashIndex + 1));
  const accessToken = hashParams.get("access_token");

  console.log("3. Authorizing client via Edge Function...");
  const funcResp = await fetch(`${SUPABASE_URL}/functions/v1/oauth-authorize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": ANON_KEY,
      "Authorization": `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      client_id: "deposity_client",
      redirect_uri: "http://localhost:3000/callback",
      scope: "openid profile email",
      state: state,
      nonce: generateRandomString(16),
      prompt: null,
      code_challenge: challenge,
      code_challenge_method: "S256",
      response_type: "code",
      remember_consent: true
    })
  });

  if (!funcResp.ok) {
    throw new Error("Authorization failed: " + await funcResp.text());
  }

  const authData = await funcResp.json();
  
  console.log("\n=================== LOGIN DATA ===================");
  console.log(`code_verifier: ${verifier}`);
  console.log(`state: ${state}`);
  console.log(`code: ${authData.code}`);
  console.log(`Callback URL: http://localhost:3000/callback?code=${authData.code}&state=${state}`);
  console.log("==================================================\n");
}

run().catch(console.error);
