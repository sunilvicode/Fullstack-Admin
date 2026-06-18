import nodemailer from "nodemailer";

// ── Create transporter (Gmail) ────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,   // tumhari Gmail ID
    pass: process.env.EMAIL_PASS,   // Gmail App Password (not actual password)
  },
});

// ── Send OTP Email ────────────────────────────────────────────
export const sendOtpEmail = async (toEmail, otp, userName) => {
  const mailOptions = {
    from: `"AdminPanel Security" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "🔐 Password Reset OTP — AdminPanel",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      </head>
      <body style="margin:0;padding:0;background:#0a0a0f;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 20px;">
          <tr>
            <td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#0f0f1a;border:1px solid rgba(255,255,255,0.08);border-radius:20px;overflow:hidden;max-width:560px;">
                
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#7c3aed,#3b82f6);padding:32px;text-align:center;">
                    <div style="width:52px;height:52px;background:rgba(255,255,255,0.15);border-radius:14px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
                      <span style="font-size:24px;">🔐</span>
                    </div>
                    <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:800;letter-spacing:-0.5px;">Password Reset</h1>
                    <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:13px;">AdminPanel Security</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:32px;">
                    <p style="color:#94a3b8;font-size:15px;margin:0 0 8px;">Hello <strong style="color:#e2e8f0;">${userName}</strong>,</p>
                    <p style="color:#94a3b8;font-size:14px;margin:0 0 24px;line-height:1.6;">
                      We received a request to reset your password. Use the OTP below to proceed. 
                      This code is valid for <strong style="color:#a78bfa;">15 minutes</strong>.
                    </p>

                    <!-- OTP Box -->
                    <div style="background:linear-gradient(135deg,rgba(139,92,246,0.15),rgba(59,130,246,0.15));border:1px solid rgba(139,92,246,0.3);border-radius:16px;padding:28px;text-align:center;margin-bottom:24px;">
                      <p style="color:#a78bfa;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 12px;">Your OTP Code</p>
                      <div style="font-size:42px;font-weight:900;letter-spacing:12px;color:#ffffff;font-family:'Courier New',monospace;margin:0 0 12px;">${otp}</div>
                      <p style="color:#64748b;font-size:12px;margin:0;">⏱ Expires in 15 minutes</p>
                    </div>

                    <!-- Warning -->
                    <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:10px;padding:14px 18px;margin-bottom:24px;">
                      <p style="color:#f87171;font-size:12px;margin:0;line-height:1.5;">
                        ⚠️ <strong>Did not request this?</strong> Ignore this email. Your password won't be changed unless you enter this code.
                      </p>
                    </div>

                    <p style="color:#475569;font-size:12px;margin:0;text-align:center;line-height:1.6;">
                      This email was sent to <strong style="color:#64748b;">${toEmail}</strong><br/>
                      from AdminPanel Security System.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:rgba(0,0,0,0.3);padding:20px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
                    <p style="color:#334155;font-size:11px;margin:0;">© 2026 AdminPanel · Secured with end-to-end encryption</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};
