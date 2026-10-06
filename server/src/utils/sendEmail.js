const nodemailer = require("nodemailer");

// Uses SMTP credentials from env. Works with Gmail (using an
// App Password, not your regular password — generate one at
// https://myaccount.google.com/apppasswords) or any other
// SMTP provider (SendGrid, Mailgun, Resend, etc.) by changing
// EMAIL_HOST/EMAIL_PORT accordingly.

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

async function sendEmail({ to, subject, html }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    // No email credentials configured — don't crash the
    // flow, just log it so local dev still works without real SMTP setup.
    console.warn(
      `⚠️  EMAIL_USER/EMAIL_PASS not set — Sending email to ${to} with subject: ${subject}`
    );
    console.log(`Content: ${html}`);
    return;
  }

  const transporter = getTransporter();

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html,
  });
}

async function sendOtpEmail(to, name, otp) {
  await sendEmail({
    to,
    subject: "Verify your DSA Roadmap account",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #0891b2;">DSA Roadmap</h2>
        <p>Hi ${name || "there"},</p>
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
        <p>Hi ${name || "there"},</p>
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
