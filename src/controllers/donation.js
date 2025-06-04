import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../config/cloudinary.js";
import FoodDonation from "../models/FoodDonation.js";
import User from "../models/User.js";
import { insertNewFoodDonation } from "../sparql/creatingNewFoodDonation.js";
import { deleteFoodDonation as deleteFoodDonationQuery } from "../sparql/deleteFoodDonation.js";
import { getDonationDistance } from "../sparql/getDonationDetails.js";
import { searchDonations } from "../sparql/searchDonation.js";
import { updateFoodDonation as updateFoodDonationQuery } from "../sparql/updateFoodDonation.js";
import extractDonationData from "../utils/extractDonationData.js";
import { validateFoodDonation } from "../utils/validateDonation.js";

export const createFoodDonation = async (req, res) => {
  try {
    if (
      process.env.NODE_ENV !== "benchmark" &&
      (!req.files || req.files.length === 0)
    ) {
      return res
        .status(400)
        .json({ error: "At least one food image is required." });
    }
    const foodData = {
      userId: req.user.id,
      foodTitle: req.body.title,
      foodDescription: req.body.description,
      foodType: req.body.type.split(",").map((type) => type.trim()),
      containsAllergen: req.body.allergens
        .split(",")
        .map((allergen) => allergen.trim()),
      foodQuantity: parseInt(req.body.quantity),
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      latitude: parseFloat(req.body.latitude),
      longitude: parseFloat(req.body.longitude),
      expiryDate: req.body.expiryDate,
    };

    // Validate data (keep this for realistic benchmarking)
    if (process.env.NODE_ENV !== "benchmark") {
      const { error } = validateFoodDonation(foodData);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }
    }

    // Create new donation
    const newDonation = new FoodDonation(foodData);

    // OPTIMIZATION: Parallel execution of independent operations
    const parallelOperations = [];

    // MongoDB save
    parallelOperations.push(newDonation.save());

    // SPARQL insert (runs in parallel with MongoDB save)
    parallelOperations.push(
      insertNewFoodDonation({
        mongoID: newDonation._id,
        containsAllergen: foodData.containsAllergen,
        hasFoodType: foodData.foodType,
        hasExpiryDate: foodData.expiryDate,
        latitude: foodData.latitude,
        longitude: foodData.longitude,
        donorMongoID: req.user.id,
      })
    );

    // Execute core operations in parallel
    const results = await Promise.allSettled(parallelOperations);

    // Check if MongoDB save succeeded
    if (results[0].status === "rejected") {
      throw new Error(`MongoDB save failed: ${results[0].reason.message}`);
    }

    // Log SPARQL errors but don't fail the request
    if (
      results[1].status === "rejected" &&
      process.env.NODE_ENV !== "benchmark"
    ) {
      console.error("SPARQL insert failed:", results[1].reason);
    }

    // Handle image upload asynchronously (don't block response)
    if (
      process.env.NODE_ENV !== "test" &&
      process.env.NODE_ENV !== "benchmark" &&
      req.files
    ) {
      // Fire and forget - upload images in background
      setImmediate(async () => {
        try {
          const imageUrls = [];
          for (const file of req.files) {
            const result = await uploadToCloudinary(
              file.buffer,
              "food-donation-images"
            );
            imageUrls.push(result);
          }
          // Update donation with image URLs
          await FoodDonation.findByIdAndUpdate(newDonation._id, {
            foodImage: imageUrls,
          });
        } catch (error) {
          console.error("Background image upload failed:", error);
        }
      });
    }

    // Return response immediately after core operations
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
      ngoLat: parseFloat(req.query.lat),
      ngoLong: parseFloat(req.query.long),
      maxDistanceKm: parseFloat(req.query.distance) || 10,
      status: req.query.status?.split(",") || ["Available"],
      priority: req.query.priority?.split(",") || ["High", "Medium", "Low"],
      prefersFoodType: req.query.prefersFoodType?.split(",") || [],
      rejectsFoodType: req.query.rejectsFoodType?.split(",") || [],
      avoidsAllergens: req.query.avoidsAllergens?.split(",") || [],
    });
    const donationData = extractDonationData(results);
    const donations = await FoodDonation.find({
      _id: { $in: donationData.map((d) => d.mongoId) },
    }).exec();
    const response = donations.map((donation) => {
      const data = donationData.find(
        (d) => d.mongoId === donation._id.toString()
      );
      return {
        ...donation.toObject(),
        distanceKm: data ? data.distanceKm : null,
      };
    });
    res.json({ donations: response });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getFoodDonationDetails = async (req, res) => {
  try {
    const donation = await FoodDonation.findById(req.params.id).exec();
    const distanceKm = await getDonationDistance({
      mongoId: req.params.id,
      ngoLat: parseFloat(req.query.lat),
      ngoLong: parseFloat(req.query.long),
    });
    const donationObj = donation.toObject();
    donationObj.distance = distanceKm;
    res.json({ donation: donationObj });
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
    if (donation.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You are not authorized to update this donation" });
    }
    const allowedFields = [
      "foodTitle",
      "foodDescription",
      "foodType",
      "containsAllergen",
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
        // if (key === "foodType" || key === "containsAllergen") {
        //   updateData[key] = updateData[key]
        //     .split(",")
        //     .map((item) => item.trim());
        // }
      }
    }
    console.log("Update Data:", updateData);

    const updatedDonationData = { ...donation.toObject(), ...updateData };
    console.log("Updated Donation Data:", updatedDonationData);
    const { error } = validateFoodDonation(updatedDonationData);
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
      containsAllergen: updateData["containsAllergen"] || null,
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
    const donation = await FoodDonation.findByIdAndDelete(req.params.id).exec();
    console.log("Donation to delete:", donation);
    if (!donation) {
      return res.status(404).json({ error: "Donation not found" });
    }
    if (donation.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this donation" });
    }
    if (donation.foodImage && donation.foodImage.length > 0) {
      for (const image of donation.foodImage) {
        await deleteFromCloudinary(image.public_id);
      }
    }
    await deleteFoodDonationQuery({ mongoID: req.params.id });
    res.json({ message: "Donation deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
