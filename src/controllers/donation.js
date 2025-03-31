import { uploadToCloudinary } from "../config/cloudinary.js";
import FoodDonation from "../models/FoodDonation.js";
import User from "../models/User.js";
import validateDonationData from "../utils/validateDonation.js";

export const createFoodDonation = async (req, res) => {
  try {
    if (!req.user.roles.includes("event_host")) {
      return res.status(403).json({ error: "User is not an event host" });
    }
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one food image is required." });
    }
    const user = await User.findById(req.user.id).exec();
    const foodData = {
      userId: req.user.id,
      foodTitle: req.body.title,
      foodDescription: req.body.description,
      foodType: req.body.type,
      address: req.body.address,
      foodQuantity: parseInt(req.body.quantity),
      expiryDate: req.body.expiryDate,
      contactPhoneNumber: user.phone,
      contactEmail: user.email,
    };

    // Upload images to Cloudinary
    const imageUrls = [];
    for (const file of req.files) {
      const result = await uploadToCloudinary(
        file.buffer,
        "food-donation-images"
      );
      imageUrls.push(result);
    }
    foodData.foodImage = imageUrls;

    // Validate data
    const { error } = validateDonationData(foodData);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Create new donation
    const newDonation = new FoodDonation(foodData);
    await newDonation.save();

    res.status(201).json({
      message: "Food donation listed successfully",
      donationId: newDonation._id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getFoodDonation = async (req, res) => {
  try {
    const donations = await FoodDonation.find().exec();
    res.json({ donations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getFoodDonationDetails = async (req, res) => {
  try {
    const donation = await FoodDonation.findById(req.params.id).exec();
    res.json({ donation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateFoodDonation = async (req, res) => {
  try {
    if (!req.user.roles.includes("event_host")) {
      return res.status(403).json({ error: "User is not an event host" });
    }
    const donation = await FoodDonation.findById(req.params.id).exec();
    if (!donation) {
      return res.status(404).json({ error: "Donation not found" });
    }
    const allowedFields = [
      "foodTitle",
      "foodDescription",
      "foodType",
      "address",
      "foodQuantity",
      "expiryDate",
    ];

    const updateData = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    const updatedDonationData = { ...donation.toObject(), ...updateData };

    const { error } = validateDonationData(updatedDonationData);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const updatedDonation = await FoodDonation.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).exec();

    res.json({
      message: "Donation updated successfully",
      donation: updatedDonation,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteFoodDonation = async (req, res) => {
  try {
    const donation = await FoodDonation.findById(req.params.id).exec();
    if (!donation) {
      return res.status(404).json({ error: "Donation not found" });
    }
    await donation.remove();
    res.json({ message: "Donation deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
