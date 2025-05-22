import { uploadToCloudinary } from "../config/cloudinary.js";
import FoodDonation from "../models/FoodDonation.js";
import User from "../models/User.js";
import { insertNewFoodDonation } from "../sparql/creatingNewFoodDonation.js";
import { searchDonations } from "../sparql/searchDonation.js";
import { updateFoodDonation as updateFoodDonationQuery } from "../sparql/updateFoodDonation.js";
import { deleteFoodDonation as deleteFoodDonationQuery } from "../sparql/deleteFoodDonation.js";
import validateDonationData from "../utils/validateDonation.js";

export const createFoodDonation = async (req, res) => {
  try {
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
      containsAllergens: req.body.allergens,
      foodQuantity: parseInt(req.body.quantity),
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      latitude: parseFloat(req.body.latitude),
      longitude: parseFloat(req.body.longitude),
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
    await insertNewFoodDonation({
      mongoID: newDonation._id,
      containsAllergen: foodData.containsAllergens,
      hasFoodType: foodData.foodType,
      hasExpiryDate: foodData.expiryDate,
      latitude: foodData.latitude,
      longitude: foodData.longitude,
      donorMongoID: req.user.id,
    });

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
    const results = await searchDonations({
      ngoLat: req.query.lat,
      ngoLong: req.query.long,
      maxDistanceKm: parseFloat(req.query.distance) || 10,
      status: req.query.status?.split(",") || ["Available"],
      priority: req.query.priority?.split(",") || ["High", "Medium", "Low"],
      prefersFoodType: req.query.prefersFoodType?.split(",") || [],
      rejectsFoodType: req.query.rejectsFoodType?.split(",") || [],
      avoidsAllergens: req.query.avoidsAllergens?.split(",") || [],
    });
    // When making frontend, transform the results to get only the mongoID and distance then use the mongoID to get the details of the donation from DB.
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
    const allowedFields = [
      "foodTitle",
      "foodDescription",
      "foodType",
      "containsAllergens",
      "foodQuantity",
      "address",
      "city",
      "state",
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
    await updateFoodDonationQuery({
      mongoID: updatedDonation._id,
      containsAllergen: updateData["containsAllergens"] || null,
      hasFoodType: updateData["foodType"] || null,
      hasExpiryDate: updateData["expiryDate"] || null,
    });

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
    await deleteFoodDonationQuery({ mongoID: req.params.id });
    res.json({ message: "Donation deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
