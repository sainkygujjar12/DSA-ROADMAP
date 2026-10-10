# Gmail sender setup for Render Free

This guide uses `EMAIL_PROVIDER=gmail` (HTTPS). If you specifically want
`smtp.gmail.com`, use the [SMTP deployment settings](../DEPLOYMENT.md#gmail-smtp-on-a-host-that-permits-smtp)
on a host that permits SMTP. Render Free blocks Gmail's SMTP ports.

The backend supports Gmail's HTTPS API for verification and password-reset codes.
No custom domain or SMTP connection is required. Sender authorization is separate
from users' Google sign-in: users never grant the app permission to their mailbox.
Only authorize an account you control, preferably a dedicated project Gmail account.

## 1. Configure Google Cloud

1. Open [Google Cloud Console](https://console.cloud.google.com/) and create a
   **separate project for the email sender**. Keep the existing Google login
   project and its `GOOGLE_CLIENT_ID` / `VITE_GOOGLE_CLIENT_ID` unchanged.
2. Under **APIs & Services > Library**, enable **Gmail API**.
3. Open **Google Auth Platform**. Configure Branding with the app name and your
   support/contact email. Choose **External** under Audience. While in Testing,
   add only the sender Gmail address as a test user.
4. Under Data Access, add `openid`, `https://www.googleapis.com/auth/userinfo.email`
   and `https://www.googleapis.com/auth/gmail.send`. Do not request mailbox read,
   modify or full-mail access.
5. Under Clients, create an OAuth client of type **Web application**, named
   `DSA Roadmap email sender`. Add this exact **Authorized redirect URI**:
   `http://127.0.0.1:53682/oauth2callback`. The local helper handles this callback;
   no public callback route needs deploying. Save the client ID and client secret.

## 2. Authorize locally

Add these values to your local `server/.env` using your editor, not chat or Git:

```dotenv
GMAIL_CLIENT_ID=YOUR_EMAIL_SENDER_CLIENT_ID
GMAIL_CLIENT_SECRET=YOUR_EMAIL_SENDER_CLIENT_SECRET
EMAIL_FROM=YOUR_PROJECT_GMAIL_ADDRESS
```

From the project directory:

```sh
cd server
npm run email:authorize
```

Open the printed authorization URL on the same computer. Sign in to the exact
Gmail account specified by `EMAIL_FROM` and grant the requested send permission.
The helper uses OAuth state and PKCE, checks the verified account matches the
sender, and writes `server/.env.gmail` with owner-only permissions. It does not
send a test email or print credentials. It listens on loopback for five minutes
and refuses to overwrite an existing output file.

An unverified-app warning may appear for your own sender project. Only proceed
if you recognize the project you created and the requested permissions. An
organization's administrator or Google may block authorization; this helper
cannot bypass that decision.

## 3. Configure Render

Open Render service **Environment > Add from .env** and paste the contents of the
generated `.env.gmail` file directly there. It contains:

```dotenv
EMAIL_PROVIDER=gmail
EMAIL_FROM=YOUR_AUTHORIZED_GMAIL_ADDRESS
GMAIL_CLIENT_ID=YOUR_EMAIL_SENDER_CLIENT_ID
GMAIL_CLIENT_SECRET=YOUR_EMAIL_SENDER_CLIENT_SECRET
GMAIL_REFRESH_TOKEN=GENERATED_BY_THE_LOCAL_HELPER
```

Keep the existing database, JWT, client URL and Google **login** variables. Remove
`SMTP2GO_API_KEY` and unused SMTP credentials from Render. Never prefix sender
secrets with `VITE_`. Save and redeploy after the Gmail-support commit passes CI.
The generated file is not automatically loaded locally; if testing locally, copy
its values into `server/.env` and restart the server.

## 4. Resolve token lifetime before launch

Google OAuth projects left in **Testing** expire sender authorization/refresh
tokens after seven days for these scopes. In Audience, move the sender project to
**In production** when appropriate, then authorize again to obtain a new token.
Move the old `.env.gmail` file somewhere secure before rerunning the helper, and
replace the Render values afterward. Changing status alone should not be relied
on to extend an already issued test token.

Publishing status is not Google verification approval. A project used only by you
to authorize your own sender account may qualify for Google's personal-use
exception; review Google's rules and any verification requirements shown in your
console. If Google requires verification, complete it before depending on this
for live email. Do not invite site users to authorize the sender project.
Even production refresh tokens can expire or be revoked (including after account
security changes). Reauthorize if needed; no code change can guarantee permanent
authorization.

## 5. Check actual delivery

After deployment, register a test account you control, verify its OTP, and test
password reset and resend. Check both inbox and spam, then inspect Render logs
for failures without logging OTPs or credentials. API acceptance is not proof of
inbox delivery. Automated tests use fake responses and send no real mail.

Personal Gmail has daily sending/recipient and anti-abuse limits. Google documents
limits around 500 messages/day, but this is not guaranteed available capacity.
Verification, resends, password resets and your normal mail share the allowance.
Do not plan a 200-user simultaneous signup event around that upper bound. The
backend refreshes access tokens automatically, coalesces concurrent refreshes,
uses bounded requests and never reports mocked success on Gmail API failures.
It does not automatically retry email sends after uncertain failures, to avoid
duplicate messages. Monitor delivery and move to a transactional provider when
volume or reliability requirements grow.

If previously shared, rotate your database password and JWT secret and revoke
the old Gmail app password. Gmail API uses OAuth; it does not need that app password.

Sources: [Gmail sending API](https://developers.google.com/workspace/gmail/api/guides/sending),
[Google OAuth token expiration](https://developers.google.com/identity/protocols/oauth2),
[Verification exceptions](https://support.google.com/cloud/answer/13464323),
[Gmail sending limits](https://support.google.com/mail/answer/22839),
[Render SMTP restrictions](https://render.com/docs/free).
