export const otpEmailTemplate = (name, otp) => ({
  subject: "🔐 OTP Verification - FoodBridge",
  text: `Hello ${name},\n\nYour OTP for verifying the donation is: ${otp}\n\nThis OTP is valid for a short time only.`,
  html: `
      <p>Hello <strong>${name}</strong>,</p>
      <p>Your OTP for verifying the donation is:</p>
      <h2>${otp}</h2>
      <p>This OTP is valid for a short time only. Do not share it with anyone.</p>
    `,
});

export const approvalEmailTemplate = (name, role) => ({
  subject: `✅ Your ${role} Application is Approved!`,
  text: `Dear ${name},\n\nCongratulations! Your application as a ${role} on FoodBridge has been approved.`,
  html: `
      <p>Dear <strong>${name}</strong>,</p>
      <p>🎉 Congratulations! Your application as a <strong>${role}</strong> has been <span style="color:green;">approved</span>.</p>
      <p>Welcome aboard. You can now log in and start using your dashboard.</p>
    `,
});

export const rejectionEmailTemplate = (name, role) => ({
  subject: `❌ Your ${role} Application is Rejected`,
  text: `Dear ${name},\n\nWe regret to inform you that your application as a ${role} on FoodBridge has been rejected.`,
  html: `
      <p>Dear <strong>${name}</strong>,</p>
      <p>We're sorry to inform you that your application as a <strong>${role}</strong> has been <span style="color:red;">rejected</span>.</p>
      <p>You may reach out to us for further clarification if needed.</p>
    `,
});

export const claimSuccessEmailTemplate = (name, donationTitle) => ({
  subject: "🎁 Claim Successful - Food Donation",
  text: `Hi ${name},\n\nYour claim for the donation "${donationTitle}" has been confirmed. Please check your dashboard for pickup/delivery details.`,
  html: `
      <p>Hi <strong>${name}</strong>,</p>
      <p>Your claim for the donation titled <strong>"${donationTitle}"</strong> has been <span style="color:green;">successfully confirmed</span>.</p>
      <p>Check your dashboard for pickup or delivery details. Thank you for being part of this mission!</p>
    `,
});

export const claimCancelEmailTemplate = ({ name, donationTitle, reason }) => {
  return {
    subject: `Your Claim on "${donationTitle}" Has Been Cancelled`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #d9534f;">Claim Cancelled</h2>
        <p>Dear ${name},</p>

        <p>We regret to inform you that your claim for the food donation titled <strong>"${donationTitle}"</strong> has been <strong>cancelled</strong>.</p>

        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}

        <p>If this was unexpected or you have any questions, feel free to reach out to our support team.</p>

        <p style="margin-top: 30px;">Thank you for being part of our effort to reduce food waste and support communities in need.</p>

        <p>Warm regards,<br/>The FoodLink Team</p>
      </div>
    `,
  };
};
