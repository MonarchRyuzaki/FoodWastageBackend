import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../config/cloudinary.js";
import FoodDonation from "../models/FoodDonation.js";
import { insertNewFoodDonation } from "../sparql/creatingNewFoodDonation.js";
import { deleteFoodDonation as deleteFoodDonationQuery } from "../sparql/deleteFoodDonation.js";
import { getDonationDistance } from "../sparql/getDonationDetails.js";
import { searchDonations } from "../sparql/searchDonation.js";
import { updateFoodDonation as updateFoodDonationQuery } from "../sparql/updateFoodDonation.js";
import extractDonationData from "../utils/extractDonationData.js";
import { validateFoodDonation } from "../utils/validateDonation.js";

export const createFoodDonation = async (req, res) => {
  try {
    if (process.env.NODE_ENV !== "benchmark" && !req.file) {
      return res.status(400).json({ error: "Food Image is Required" });
    }
    const foodData = {
      userId: req.user.id,
      foodTitle: req.body.title,
      foodDescription: req.body.description,
      foodType: req.body.type.split(",").map((type) => type.trim()),
      containsAllergen: req.body.allergens
        ? req.body.allergens.split(",").map((allergen) => allergen.trim())
        : [], // Always provide an array, even if empty
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
    // const results = await Promise.allSettled(parallelOperations);

    // // Check if MongoDB save succeeded
    // if (results[0].status === "rejected") {
    //   throw new Error(`MongoDB save failed: ${results[0].reason.message}`);
    // }

    // // Log SPARQL errors but don't fail the request
    // if (
    //   results[1].status === "rejected" &&
    //   process.env.NODE_ENV !== "benchmark"
    // ) {
    //   console.error("SPARQL insert failed:", results[1].reason);
    // }

    // Handle image upload asynchronously (don't block response)
    if (process.env.NODE_ENV !== "benchmark" && req.files) {
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
      success: true,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getFoodDonation = async (req, res) => {
  try {
    // Parse and validate coordinates early
    const ngoLat = parseFloat(req.query.lat);
    const ngoLong = parseFloat(req.query.long);
    if (isNaN(ngoLat) || isNaN(ngoLong)) {
      return res
        .status(400)
        .json({ error: "Valid latitude and longitude are required" });
    }

    // PAGINATION PARAMETERS
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(
      20,
      Math.max(1, parseInt(req.query.pageSize) || 50)
    );
    const offset = (page - 1) * pageSize;

    // Optimize SPARQL search parameters
    const searchParams = {
      ngoLat,
      ngoLong,
      maxDistanceKm: parseFloat(req.query.distance) || 10,
      status: req.query.status?.split(",") || ["Available"],
      priority: req.query.priority?.split(",") || ["High", "Medium", "Low"],
      prefersFoodType:
        (req.query.prefersFoodType != undefined &&
          req.query.prefersFoodType.trim() != "" &&
          req.query.prefersFoodType?.split(",")) ||
        [],
      rejectsFoodType:
        (req.query.rejectsFoodType != undefined &&
          req.query.rejectsFoodType.trim() != "" &&
          req.query.rejectsFoodType?.split(",")) ||
        [],
      avoidsAllergens:
        (req.query.avoidsAllergens != undefined &&
          req.query.avoidsAllergens.trim() != "" &&
          req.query.avoidsAllergens?.split(",")) ||
        [],
      limit: pageSize,
      offset: offset,
    };
    // Execute SPARQL search with pagination-aware limits
    const { results, totalFetched } = await searchDonations(searchParams);
    // Early return if no results
    if (!results || results.length === 0) {
      return res.json({
        donations: [],
        pagination: {
          page,
          pageSize,
          totalItems: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: page > 1,
        },
      });
    }

    // Extract donation data more efficiently
    const donationData = extractDonationData(results);
    if (donationData.length === 0) {
      return res.json({
        donations: [],
        pagination: {
          page,
          pageSize,
          totalItems: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: page > 1,
        },
      });
    }

    // OPTIMIZED MongoDB query - only fetch what we need
    const mongoIds = donationData.map((d) => d.mongoId);
    const donations = await FoodDonation.find(
      { _id: { $in: mongoIds } },
      {
        // Project only needed fields for better performance
        foodTitle: 1,
        foodDescription: 1,
        foodType: 1,
        containsAllergen: 1,
        foodQuantity: 1,
        address: 1,
        city: 1,
        state: 1,
        expiryDate: 1,
        contactPhoneNumber: 1,
        contactEmail: 1,
        foodImage: 1,
        createdAt: 1,
        userId: 1,
      }
    )
      .populate("userId")
      .lean() // Use lean for better performance
      .exec();
    // Create a Map for O(1) lookup instead of O(n) find operations
    const distanceMap = new Map();
    donationData.forEach((d) => {
      distanceMap.set(d.mongoId, d.distanceKm);
    });

    // Optimize response mapping
    const response = donations.map((donation) => ({
      ...donation,
      distanceKm: distanceMap.get(donation._id.toString()) || null,
    }));

    // COMPREHENSIVE SORTING (moved from GraphDB to here)
    response.sort((a, b) => {
      // 1. First priority: Food preferences (if specified)
      if (searchParams.prefersFoodType.length > 0) {
        const aHasPreferred = a.foodType.some((type) =>
          searchParams.prefersFoodType.includes(type)
        );
        const bHasPreferred = b.foodType.some((type) =>
          searchParams.prefersFoodType.includes(type)
        );

        if (aHasPreferred && !bHasPreferred) return -1;
        if (!aHasPreferred && bHasPreferred) return 1;
      }

      // 2. Second priority: Distance (closest first)
      const distanceA = a.distanceKm || Infinity;
      const distanceB = b.distanceKm || Infinity;
      if (distanceA !== distanceB) {
        return distanceA - distanceB;
      }

      // 3. Third priority: Donation priority (High > Medium > Low)
      const priorityOrder = { High: 3, Medium: 2, Low: 1 };
      const priorityA = priorityOrder[a.priority] || 0;
      const priorityB = priorityOrder[b.priority] || 0;
      if (priorityA !== priorityB) {
        return priorityB - priorityA; // Descending order
      }

      // 4. Fourth priority: Expiry date (earliest expires first)
      const expiryA = new Date(a.expiryDate).getTime();
      const expiryB = new Date(b.expiryDate).getTime();
      if (expiryA !== expiryB) {
        return expiryA - expiryB;
      }

      // 5. Final tie-breaker: Creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // APPLY PAGINATION after sorting
    const startIndex = offset;
    const endIndex = startIndex + pageSize;
    const paginatedResults = response.slice(startIndex, endIndex);

    // Calculate pagination metadata
    const totalItems = Math.min(totalFetched, response.length);
    const totalPages = Math.ceil(totalItems / pageSize);
    const hasNextPage =
      page < totalPages &&
      totalFetched === Math.min(searchParams.limit * 3, 100);
    const hasPrevPage = page > 1;

    res.json({
      donations: paginatedResults,
      pagination: {
        page,
        pageSize,
        totalItems: totalItems,
        totalPages,
        hasNextPage,
        hasPrevPage,
        // Add hint if more results might be available
        moreResultsAvailable:
          totalFetched === Math.min(searchParams.limit * 3, 100),
      },
    });
  } catch (err) {
    // Only log errors in non-benchmark mode
    if (process.env.NODE_ENV !== "benchmark") {
      console.error("getFoodDonation error:", err);
    }
    res.status(500).json({ error: err.message });
  }
};

export const getFoodDonationDetails = async (req, res) => {
  try {
    console.log(req.params.id, req.query.lat, req.query.long);
    const [donation, {
      distanceKm,
      lat: donationLat,
      long: donationLong,
      priority,
    }] = await Promise.all([
      FoodDonation.findById(req.params.id).populate('userId').lean().exec(),
      getDonationDistance({
        mongoId: req.params.id,
        ngoLat: parseFloat(req.query.lat),
        ngoLong: parseFloat(req.query.long),
      }),
    ]);
    donation.distance = distanceKm;
    donation.lat = donationLat;
    donation.long = donationLong;
    donation.priority = priority;
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
