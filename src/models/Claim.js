import mongoose from "mongoose";

const claimSchema = new mongoose.Schema(
  {
    claimId: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true,
    },
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NGO",
      required: true,
    },
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoodDonation",
      required: true,
    },
    mode: {
      type: String,
      enum: ["self_pickup", "delivery"],
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    bufferExpiryTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "expired", "delivered", "cancelled"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Claim", claimSchema);
