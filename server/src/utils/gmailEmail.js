const nodemailer = require('nodemailer');

// One sender per process: reuse access tokens and coalesce concurrent refreshes.
function createGmailSender(config, request = (...args) => fetch(...args), now = Date.now) {
  let accessToken, expiresAt = 0, refreshing;
  const composer = nodemailer.createTransport({ streamTransport: true, buffer: true, newline: 'windows' });
  async function getAccessToken() {
    if (accessToken && now() < expiresAt - 60000) return accessToken;
    if (!refreshing) {
      refreshing = (async () => {
        const response = await request('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ client_id: config.clientId, client_secret: config.clientSecret,
            refresh_token: config.refreshToken, grant_type: 'refresh_token' }),
          signal: AbortSignal.timeout(10000),
        });
        if (!response.ok) throw new Error('Token refresh failed');
        const data = await response.json();
        if (typeof data.access_token !== 'string' || !data.access_token ||
            !Number.isFinite(data.expires_in) || data.expires_in <= 0 || data.token_type?.toLowerCase() !== 'bearer') {
          throw new Error('Invalid token response');
        }
        accessToken = data.access_token;
        expiresAt = now() + data.expires_in * 1000;
        return accessToken;
      })().finally(() => { refreshing = undefined; });
    }
    return refreshing;
  }
  return async ({ to, subject, html }) => {
    try {
      if (![config.clientId, config.clientSecret, config.refreshToken, config.from].every(value => value?.trim())) throw new Error('Missing Gmail configuration');
      // Enforce a single address; never let recipient input introduce MIME headers.
      if (![to, config.from].every(value => typeof value === 'string' && /^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/.test(value))) throw new Error('Invalid email address');
      const message = await composer.sendMail({ from: { name: 'DSA Roadmap', address: config.from }, to,
        subject, html, disableFileAccess: true, disableUrlAccess: true });
      const token = await getAccessToken();
      const response = await request('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({ raw: message.message.toString('base64url') }),
        signal: AbortSignal.timeout(10000),
      });
      if (response.status === 401) { accessToken = undefined; expiresAt = 0; }
      if (!response.ok) throw new Error('Gmail rejected message');
      const result = await response.json();
      if (typeof result.id !== 'string' || !result.id) throw new Error('Gmail did not acknowledge message');
      return { success: true, mocked: false };
    } catch {
      // No raw provider errors, tokens, recipient addresses or OTPs in logs.
      // Do not retry sends: a lost response may follow an accepted message.
      throw new Error('Email service is temporarily unavailable. Please try again later.');
    }
  };
}

let cachedConfig, cachedSender;
function sendGmailEmail(message) {
  const config = { clientId: process.env.GMAIL_CLIENT_ID, clientSecret: process.env.GMAIL_CLIENT_SECRET,
    refreshToken: process.env.GMAIL_REFRESH_TOKEN, from: process.env.EMAIL_FROM };
  if (!cachedConfig || Object.keys(config).some(key => config[key] !== cachedConfig[key])) {
    cachedConfig = config;
    cachedSender = createGmailSender(config);
  }
  return cachedSender(message);
}
module.exports = { createGmailSender, sendGmailEmail };
