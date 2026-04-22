import nodemailer from "nodemailer";

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: false, // use TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send password reset email with magic link
 * @param {string} email - User's email address
 * @param {string} token - Reset token
 * @returns {Promise<void>}
 */
export async function sendPasswordResetEmail(email, token) {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const expiryMinutes = 15;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; }
          .card { background: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 10px; }
          .title { font-size: 28px; font-weight: bold; color: #1f2937; margin: 0; }
          .subtitle { color: #6b7280; margin: 10px 0 0 0; }
          .content { margin: 30px 0; line-height: 1.6; color: #374151; }
          .button-container { text-align: center; margin: 30px 0; }
          .button { display: inline-block; background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; }
          .button:hover { opacity: 0.9; }
          .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; border-radius: 4px; color: #92400e; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
          .code-block { background-color: #f3f4f6; padding: 12px; border-radius: 4px; font-family: monospace; word-break: break-all; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="header">
              <div class="logo">🛡️ InsureAI</div>
              <h1 class="title">Reset Your Password</h1>
              <p class="subtitle">Secure password reset link</p>
            </div>

            <div class="content">
              <p>Hello,</p>
              <p>We received a request to reset your password. Click the button below to create a new password.</p>

              <div class="button-container">
                <a href="${resetLink}" class="button">Reset Password</a>
              </div>

              <p style="text-align: center; color: #6b7280; margin: 20px 0;">or copy this link:</p>
              <div class="code-block">${resetLink}</div>

              <div class="warning">
                <strong>⏱️ Link Expires in ${expiryMinutes} minutes</strong>
                <p style="margin: 5px 0 0 0;">This link is valid until ${new Date(Date.now() + expiryMinutes * 60 * 1000).toLocaleString()}</p>
              </div>

              <p><strong>Didn't request this?</strong> You can ignore this email. Your password won't change unless you reset it.</p>
            </div>

            <div class="footer">
              <p>© ${new Date().getFullYear()} InsureAI. All rights reserved.</p>
              <p>This is an automated email, please do not reply directly.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const mailOptions = {
    from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
    to: email,
    subject: "Reset Your InsureAI Password",
    html: htmlContent,
    text: `
Password Reset Request

Click the link below to reset your password:
${resetLink}

This link expires in ${expiryMinutes} minutes.

If you didn't request this, you can ignore this email.

© InsureAI
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✉️ Password reset email sent to ${email}`);
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw new Error(`Failed to send reset email: ${error.message}`);
  }
}

/**
 * Verify email transporter connection
 * Use this during app startup to verify email config
 */
export async function verifyEmailConfig() {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn(
        "⚠️  Email service not configured. Password reset emails won't be sent.",
      );
      console.warn(
        "   Configure SMTP_USER and SMTP_PASS in .env to enable email functionality.",
      );
      return false;
    }

    await transporter.verify();
    console.log("✅ Email service connected successfully");
    return true;
  } catch (error) {
    console.warn("⚠️  Email service verification failed:", error.message);
    console.warn(
      "   Password reset emails may not work. Check your SMTP configuration.",
    );
    return false;
  }
}
