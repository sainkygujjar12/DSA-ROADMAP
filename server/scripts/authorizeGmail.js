const http = require('node:http');
const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const { OAuth2Client } = require('google-auth-library');

const serverRoot = path.resolve(__dirname, '..');
require('dotenv').config({ path: path.join(serverRoot, '.env'), quiet: true });
const redirectUri = 'http://127.0.0.1:53682/oauth2callback';
const scope = 'https://www.googleapis.com/auth/gmail.send';

async function main() {
  for (const key of ['GMAIL_CLIENT_ID', 'GMAIL_CLIENT_SECRET', 'EMAIL_FROM']) {
    if (!process.env[key]?.trim()) throw new Error(`Set ${key} in server/.env first. See docs/GMAIL_SETUP.md.`);
  }
  const output = path.join(serverRoot, '.env.gmail');
  try {
    await fs.access(output);
    throw new Error('server/.env.gmail already exists. Move it to a secure location before authorizing again.');
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const client = new OAuth2Client({ clientId: process.env.GMAIL_CLIENT_ID,
    clientSecret: process.env.GMAIL_CLIENT_SECRET, redirectUri,
    transporterOptions: { timeout: 10000, retryConfig: { retry: 0 } } });
  const state = crypto.randomBytes(32).toString('hex');
  const { codeVerifier, codeChallenge } = await client.generateCodeVerifierAsync();
  let handling = false;
  const server = http.createServer(async (req, res) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Referrer-Policy', 'no-referrer');
    const url = new URL(req.url, redirectUri);
    if (req.method !== 'GET' || url.pathname !== '/oauth2callback') { res.writeHead(404); return res.end('Not found'); }
    if (url.searchParams.get('state') !== state || handling) { res.writeHead(400); return res.end('Invalid or already used authorization request.'); }
    handling = true;
    try {
      if (url.searchParams.has('error') || !url.searchParams.get('code')) throw new Error('Authorization denied');
      const { tokens } = await client.getToken({ code: url.searchParams.get('code'), codeVerifier });
      if (!tokens.refresh_token || !tokens.id_token || !tokens.scope?.split(' ').includes(scope)) throw new Error('Missing permission or refresh token');
      const identity = await client.verifyIdToken({ idToken: tokens.id_token, audience: process.env.GMAIL_CLIENT_ID });
      const account = identity.getPayload();
      if (!account.email_verified || account.email?.toLowerCase() !== process.env.EMAIL_FROM.trim().toLowerCase()) throw new Error('Wrong sender account');
      const values = { EMAIL_PROVIDER: 'gmail', EMAIL_FROM: account.email, GMAIL_CLIENT_ID: process.env.GMAIL_CLIENT_ID,
        GMAIL_CLIENT_SECRET: process.env.GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN: tokens.refresh_token };
      // Restrictive permissions, exclusive creation, and an ignored filename.
      // Never print these credentials to terminal output or callback responses.
      await fs.writeFile(output, Object.entries(values).map(([key, value]) => `${key}=${JSON.stringify(value)}`).join('\n') + '\n', { mode: 0o600, flag: 'wx' });
      res.end('Gmail sender authorized. You may close this tab. Follow the terminal instructions.');
      console.log('Saved credentials to server/.env.gmail (Git-ignored, owner-readable only).');
      console.log('Import that file into Render Environment using Add from .env. Never paste its contents into chat.');
      console.log('Before launch, check Google Auth Platform > Audience: Testing grants expire after seven days.');
      if (tokens.refresh_token_expires_in) console.log('Google issued a time-limited refresh token; reauthorization will be required before it expires.');
    } catch {
      res.writeHead(400);
      res.end('Authorization failed. Confirm the sender account, Gmail send permission and OAuth configuration, then run the command again.');
      console.error('Gmail authorization failed. No credentials were printed. See docs/GMAIL_SETUP.md.');
      process.exitCode = 1;
    } finally { clearTimeout(timeout); server.close(); }
  });
  const timeout = setTimeout(() => { console.error('Authorization timed out. Run npm run email:authorize again.'); process.exitCode = 1; server.close(); }, 5 * 60 * 1000);
  server.on('error', () => { clearTimeout(timeout); console.error('Cannot start the local authorization listener on port 53682. Close the other listener and retry.'); process.exitCode = 1; });
  server.listen(53682, '127.0.0.1', () => {
    console.log('Open this URL locally and authorize only your project sender Gmail account:');
    console.log(client.generateAuthUrl({ access_type: 'offline', prompt: 'consent',
      scope: ['openid', 'email', scope], state, code_challenge: codeChallenge,
      code_challenge_method: 'S256', login_hint: process.env.EMAIL_FROM }));
  });
}
if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
module.exports = { main };
