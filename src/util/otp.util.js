const crypto = require("crypto");
const transporter = require("../config/mailer.config");

const otpStore = new Map();

const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const storeOtp = (type, target, otp) => {
  const key = `${type}:${target}`;
  otpStore.set(key, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });
};

const verifyOtp = (type, target, otp) => {
  const key = `${type}:${target}`;
  const record = otpStore.get(key);
  if (!record) return false;
  if (record.expiresAt < Date.now()) {
    otpStore.delete(key);
    return false;
  }
  const isValid = record.otp === otp;
  if (isValid) otpStore.delete(key);
  return isValid;
};

const sendEmailOtp = async (email, otp) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[OTP][EMAIL] ${email}: ${otp}`);
    return { sent: true, fallback: true };
  }

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Mã OTP xác thực email",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h3>Xác thực email</h3>
        <p>Mã OTP của bạn là:</p>
        <div style="font-size: 24px; font-weight: bold; letter-spacing: 4px; margin: 16px 0;">${otp}</div>
        <p>Mã này có hiệu lực trong 5 phút.</p>
      </div>
    `,
  });

  return { sent: true };
};

const sendPhoneOtp = async (phone, otp) => {
  console.log(`[OTP][PHONE] ${phone}: ${otp}`);
  return { sent: true };
};

module.exports = {
  generateOtp,
  storeOtp,
  verifyOtp,
  sendEmailOtp,
  sendPhoneOtp,
};
