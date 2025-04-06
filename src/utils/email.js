import nodemailer from "nodemailer";

// Gmail-based transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send an email with given options
 * @param {Object} options
 * @param {String} options.to - Recipient email
 * @param {String} options.subject - Subject line
 * @param {String} options.text - Plain text body (optional)
 * @param {String} options.html - HTML body (optional)
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("❌ Email sending failed:", error);
    } else {
      console.log(`📧 Email sent to ${to}:`, info.response);
    }
  });
};
