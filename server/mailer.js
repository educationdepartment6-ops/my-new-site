const nodemailer = require('nodemailer');

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || 'MOG WRLD <no-reply@mogwrld.com>';
const SITE_URL = process.env.SITE_URL || 'http://localhost:4173';

let transporter = null;
if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
  console.log('[MAILER] Configured SMTP transport for:', SMTP_HOST);
} else {
  console.log('[MAILER] No SMTP credentials provided. Running in local dev mode (links logged to console).');
}

async function sendVerificationEmail(email, name, token) {
  const verifyUrl = `${SITE_URL}/verify-email?token=${token}`;
  console.log(`\n============================================================`);
  console.log(`[EMAIL DISPATCH] To: ${email} (${name})`);
  console.log(`[SUBJECT]: Verify your MOG WRLD Research Account`);
  console.log(`[VERIFICATION LINK]: ${verifyUrl}`);
  console.log(`============================================================\n`);

  if (!transporter) return { success: true, mode: 'local_dev', verifyUrl };

  const html = `
    <div style="background-color:#090A0B; color:#F4F4F5; font-family:sans-serif; padding:40px 20px; max-width:600px; margin:0 auto; border-radius:16px;">
      <div style="text-align:center; margin-bottom:24px;">
        <h1 style="color:#10B981; font-family:monospace; margin:0; font-size:24px;">MOG WRLD</h1>
        <p style="color:#71717A; font-size:12px; margin-top:4px;">Laboratory Research Compounds</p>
      </div>
      <div style="background-color:#18181B; border:1px solid #27272A; border-radius:12px; padding:24px;">
        <h2 style="margin-top:0; font-size:16px; color:#FFFFFF;">Welcome, ${name}</h2>
        <p style="color:#A1A1AA; font-size:13px; line-height:1.6;">
          Thank you for creating an account with MOG WRLD. Please confirm your email address to activate your research customer account.
        </p>
        <div style="text-align:center; margin:28px 0;">
          <a href="${verifyUrl}" style="background-color:#10B981; color:#000000; font-weight:bold; padding:12px 28px; border-radius:8px; text-decoration:none; display:inline-block; font-size:13px;">
            Verify Email Address
          </a>
        </div>
        <p style="color:#71717A; font-size:11px;">
          This verification link expires in 24 hours. If you did not create this account, please disregard this email.
        </p>
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to: email,
      subject: 'Verify your MOG WRLD Research Account',
      html
    });
    return { success: true, messageId: info.messageId, verifyUrl };
  } catch (err) {
    console.error('[MAILER ERROR] Failed to send verification email:', err.message);
    return { success: false, error: err.message, verifyUrl };
  }
}

async function sendPasswordResetEmail(email, name, token) {
  const resetUrl = `${SITE_URL}/reset-password?token=${token}`;
  console.log(`\n============================================================`);
  console.log(`[EMAIL DISPATCH] To: ${email} (${name})`);
  console.log(`[SUBJECT]: Reset your MOG WRLD Account Password`);
  console.log(`[RESET LINK]: ${resetUrl}`);
  console.log(`============================================================\n`);

  if (!transporter) return { success: true, mode: 'local_dev', resetUrl };

  const html = `
    <div style="background-color:#090A0B; color:#F4F4F5; font-family:sans-serif; padding:40px 20px; max-width:600px; margin:0 auto; border-radius:16px;">
      <div style="text-align:center; margin-bottom:24px;">
        <h1 style="color:#10B981; font-family:monospace; margin:0; font-size:24px;">MOG WRLD</h1>
        <p style="color:#71717A; font-size:12px; margin-top:4px;">Security & Requisition Portal</p>
      </div>
      <div style="background-color:#18181B; border:1px solid #27272A; border-radius:12px; padding:24px;">
        <h2 style="margin-top:0; font-size:16px; color:#FFFFFF;">Password Reset Request</h2>
        <p style="color:#A1A1AA; font-size:13px; line-height:1.6;">
          We received a request to reset the password for your MOG WRLD account (${email}). Click the button below to set a new password.
        </p>
        <div style="text-align:center; margin:28px 0;">
          <a href="${resetUrl}" style="background-color:#10B981; color:#000000; font-weight:bold; padding:12px 28px; border-radius:8px; text-decoration:none; display:inline-block; font-size:13px;">
            Reset Password
          </a>
        </div>
        <p style="color:#71717A; font-size:11px;">
          This single-use link expires in 30 minutes. If you did not request a password reset, you can safely ignore this email.
        </p>
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to: email,
      subject: 'Reset your MOG WRLD Account Password',
      html
    });
    return { success: true, messageId: info.messageId, resetUrl };
  } catch (err) {
    console.error('[MAILER ERROR] Failed to send password reset email:', err.message);
    return { success: false, error: err.message, resetUrl };
  }
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};
