import mongoose from "mongoose";
import { allergens, foodTypes } from "../utils/foodEnums.js"

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
      enum: ["available", "claimed", "delivered", "expired"],
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
      type: [String],
      required: [true, "Food type is required"],
      enum: {
        values: foodTypes,
        message: "`{VALUE}` is not a valid food type",
      },
    },

    containsAllergens: {
      type: [String],
      required: [true, "Allergen list is required"],
      enum: {
        values: allergens,
        message: "`{VALUE}` is not a recognized allergen",                      
      },
    },
    foodQuantity: {
      type: Number,
      required: true,
    },
    foodImage: [
      {
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
      },
    ],
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
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
