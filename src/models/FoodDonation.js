import mongoose from "mongoose";

const foodDonationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["available", "claimed", "delivered"],
      default: "available",
    },
    foodTitle: {
      type: String,
      required: true,
    },
    foodDescription: {
      type: String,
      required: true,
    },
    foodType: {
      type: String,
      required: true,
    },
    foodQuantity: {
      type: Number,
      required: true,
    },
    foodImage: [{
      url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
    }],
    address: {
      type: String,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    contactPhoneNumber: {
      type: String,
      required: true,
    },
    contactEmail: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("FoodDonation", foodDonationSchema);
