import cloudinary from "../config/cloudinary.js";
import FoodDonation from "../models/FoodDonation.js";
import { validateDonationData } from "../utils/validateDonation.js";

export const createFoodDonation = async (req, res) => {
  try {
    const { title, description, type, address, quantity, expiryDate } =
      req.body;

    // Validate data
    const errors = validateDonationData(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    if (!req.user.roles.includes("event_host")) {
      return res.status(403).json({ error: "User is not an event host" });
    }

    // Upload images to Cloudinary if present
    let food_images = [];
    if (req.files && req.files.food_images) {
      const uploadPromises = req.files.food_images.map((file) =>
        cloudinary.uploader.upload(file.path)
      );
      const results = await Promise.all(uploadPromises);
      food_images = results.map((result) => result.secure_url);
    }

    // Create new donation
    const newDonation = new FoodDonation({
      userId: req.user.id,
      foodTitle: title,
      foodDescription: description,
      foodType: type,
      foodQuantity: quantity,
      foodImage: food_images,
      address: address,
      contactPhoneNumber: contactPhoneNumber,
      contactEmail: contactEmail,
      expiryDate,
    });

    const savedDonation = await newDonation.save();
    res.status(201).json({
      message: "Food donation listed successfully",
      donationId: savedDonation._id,
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
    const donation = await FoodDonation.findById(req.params.id).exec();
    if (!donation) {
      return res.status(404).json({ error: "Donation not found" });
    }
    const updatedDonation = await FoodDonation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).exec();
    res.json({ donation: updatedDonation });
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
