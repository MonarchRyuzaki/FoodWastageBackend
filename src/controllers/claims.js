import Claim from "../models/Claim.js";
import FoodDonation from "../models/FoodDonation.js";
import { isBufferExpired } from "../utils/checkBufferExpiry.js";
import { sendEmail } from "../utils/email.js";
import { claimCancelEmailTemplate, claimSuccessEmailTemplate, otpEmailTemplate } from "../utils/emailTemplates.js";
import { generateOtp } from "../utils/generateOTP.js";

export const claimDonation = async (req, res) => {
  try {
    if (!req.user.role.includes("ngo")) {
      return res.status(403).json({ error: "User is not an NGO." });
    }
    const { donationId } = req.params;
    const { deliveryMode, pickupBufferTime } = req.body;
    const ngoId = req.user.id;

    const donation = await FoodDonation.findById(donationId);
    if (!donation || donation.status === "claimed") {
      return res
        .status(400)
        .json({ error: "Donation unavailable or already claimed." });
    }

    const bufferExpiryTime = new Date(
      Date.now() + parseDuration(pickupBufferTime)
    );
    const otp = generateOtp();

    const claim = await Claim.create({
      ngoId,
      donationId,
      deliveryMode,
      bufferExpiryTime,
      otp,
      status: "pending",
    });

    const { subject, text, html } = otpEmailTemplate(req.user.name, otp);
    sendEmail({
      to: req.user.email,
      subject,
      text,
      html,
    });

    donation.status = "claimed";
    await donation.save();

    res.status(200).json({
      message: "Food donation claimed successfully",
      claimedBy: { ngoId: claim.ngoId },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    if (!req.user.role.includes("ngo")) {
      return res.status(403).json({ error: "User is not an NGO." });
    }
    const { donationId } = req.params;
    const { otp } = req.body;

    const claim = await Claim.findOne({ donationId });
    if (!claim || claim.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP. Please try again." });
    }

    if (claim.status === "expired") {
      return res.status(400).json({ error: "Claim expired." });
    }

    if (isBufferExpired(claim.bufferExpiryTime)) {
      claim.status = "expired";
      await claim.save();
      const donation = await FoodDonation.findById(donationId);
      donation.status = "available";
      await donation.save();
      return res.status(400).json({ error: "Claim expired." });
    }

    claim.status = "delivered";
    await claim.save();

    const donation = await FoodDonation.findById(donationId);
    donation.status = "delivered";
    await donation.save();

    const {subject, text, html} = claimSuccessEmailTemplate(
      req.user.name,
      donation.title
    );
    sendEmail({
      to: req.user.email,
      subject,
      text,
      html,
    });

    res.status(200).json({
      message: "Claim verified successfully. Donation marked as delivered.",
      newStatus: "delivered",
    });
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
};

export const cancelClaim = async (req, res) => {
  try {
    if (!req.user.role.includes("ngo")) {
      return res.status(403).json({ error: "User is not an NGO." });
    }
    const { claimId } = req.params;
    const claim = await Claim.findById(claimId);
    if (!claim || claim.status !== "active") {
      return res
        .status(400)
        .json({ error: "Claim not found or not cancellable." });
    }

    const {subject, text, html} = claimCancelEmailTemplate(
      req.user.name,
      donation.title
    );
    sendEmail({
      to: req.user.email,
      subject,
      text,
      html,
    });

    const donation = await FoodDonation.findById(claim.donationId);
    donation.status = "available";
    await donation.save();

    claim.status = "canceled";
    await claim.save();

    res
      .status(200)
      .json({ message: "Claimed donation canceled successfully." });
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
};

export const getClaimsByStatus = async (req, res) => {
  try {
    if (!req.user.role.includes("ngo")) {
      return res.status(403).json({ error: "User is not an NGO." });
    }
    const { status } = req.query;
    const ngoId = req.user.id;
    const claims = await Claim.find({ ngoId, status });
    res.status(200).json(claims);
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
};

// Helper to parse '2h', '30m' into milliseconds
function parseDuration(durationStr) {
  const match = durationStr.match(/(\d+)([hm])/);
  const value = parseInt(match[1]);
  const unit = match[2];
  return unit === "h" ? value * 60 * 60 * 1000 : value * 60 * 1000;
}
