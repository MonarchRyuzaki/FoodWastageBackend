import crypto from 'crypto';

export const generateOtp = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    otp += digits[bytes[i] % 10]; // Each digit is between 0-9
  } 
  return otp;
};
