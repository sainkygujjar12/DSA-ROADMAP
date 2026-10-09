const nodemailer = require("nodemailer");
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

// Uses SMTP credentials from env. Works with Gmail (using an
// App Password, not your regular password — generate one at
// https://myaccount.google.com/apppasswords) or any other
// SMTP provider (SendGrid, Mailgun, Resend, etc.) by changing
// EMAIL_HOST/EMAIL_PORT accordingly.

function getTransporter() {
  const port = Number(process.env.EMAIL_PORT) || 587;

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port,
    secure: port === 465,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

async function sendEmail({ to, subject, html }) {
  // Render Free blocks common SMTP ports. HTTPS transactional email works
  // without an always-on worker or a new runtime dependency.
  if (process.env.EMAIL_PROVIDER === 'brevo') {
    if (!process.env.BREVO_API_KEY || !process.env.EMAIL_FROM) throw new Error('Email service is not configured');
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ sender: { name: 'DSA Roadmap', email: process.env.EMAIL_FROM }, to: [{ email: to }], subject, htmlContent: html }),
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error('Email provider rejected request');
      await response.arrayBuffer();
      return { success: true, mocked: false };
    } catch {
      // Never include the provider response, API key, recipient or OTP in logs.
      throw new Error('Email service is temporarily unavailable. Please try again later.');
    }
  }
  const hasSmtpCredentials =
    process.env.EMAIL_USER && process.env.EMAIL_PASS;

  if (!hasSmtpCredentials) {
    if (process.env.NODE_ENV === "production") throw new Error("Email service is not configured");
    console.log("\n--------------------------------------------------");
    console.log(`📧 [MOCK EMAIL] To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`\nContent:\n${html}`);
    console.log("--------------------------------------------------\n");
    return { success: true, mocked: true };
  }

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
    });

    return { success: true, mocked: false };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error(
        `📧 SMTP failed (${error.code || "unknown"}). Falling back to local OTP output.`
      );
      console.log(`\n[LOCAL OTP EMAIL]\nTo: ${to}\nSubject: ${subject}\n${html}\n`);
      return { success: true, mocked: true, smtpError: error.code };
    }

    throw new Error(
      "Email service unavailable. Check EMAIL_USER, EMAIL_PASS, EMAIL_HOST, and EMAIL_PORT."
    );
  }
}

async function sendOtpEmail(to, name, otp) {
  await sendEmail({
    to,
    subject: "Verify your DSA Roadmap account",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #0891b2;">DSA Roadmap</h2>
        <p>Hi ${escapeHtml(name || "there")},</p>
        <p>Your verification code is:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; background: #0f172a; color: #22d3ee; padding: 16px 24px; border-radius: 8px; text-align: center; margin: 20px 0;">
          ${otp}
        </div>
        <p>This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

async function sendResetPasswordOtpEmail(to, name, otp) {
  await sendEmail({
    to,
    subject: "Reset your DSA Roadmap password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #0891b2;">DSA Roadmap</h2>
        <p>Hi ${escapeHtml(name || "there")},</p>
        <p>You requested to reset your password. Your verification code is:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; background: #0f172a; color: #22d3ee; padding: 16px 24px; border-radius: 8px; text-align: center; margin: 20px 0;">
          ${otp}
        </div>
        <p>This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

module.exports = { sendEmail, sendOtpEmail, sendResetPasswordOtpEmail };
