import dotenv from "dotenv";
import fs from "fs";
import mongoose from "mongoose";
import path from "path";
import FoodDonation from "../src/models/FoodDonation.js";

// Load environment variables
dotenv.config({ path: "../.env" });

const DONATION_IDS_TXT_FILE = path.join(
  process.cwd(),
  "donation-ids.txt"
);

async function fetchAllDonationIds() {
  try {
    console.log("Connecting to MongoDB...");

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URL, {
      maxPoolSize: 10,
    });

    console.log("Connected to MongoDB successfully");

    // Fetch all donation IDs from the database
    console.log("Fetching donation IDs...");
    const donations = await FoodDonation.find(
      { status: { $in: ["available", "claimed"] } }, // Only fetch active donations
      { _id: 1 } // Only fetch the ID field for performance
    )
      .lean()
      .exec();

    const donationIds = donations.map((donation) => donation._id.toString());

    console.log(`Found ${donationIds.length} donation IDs`);

    if (donationIds.length === 0) {
      console.warn(
        "No donations found! Make sure you have some test data in your database."
      );
      process.exit(1);
    }

    // Save the IDs to a JSON file (for other uses)
    const data = {
      totalCount: donationIds.length,
      lastUpdated: new Date().toISOString(),
      donationIds: donationIds,
    };

    // Save the IDs to a simple text file (for Lua script)
    const txtData = donationIds.join("\n");
    fs.writeFileSync(DONATION_IDS_TXT_FILE, txtData);

    console.log(`✅ Successfully saved ${donationIds.length} donation IDs to:`);
    console.log(`   - ${DONATION_IDS_TXT_FILE}`);
    console.log("Sample IDs:", donationIds.slice(0, 5));
  } catch (error) {
    console.error("❌ Error fetching donation IDs:", error.message);
    process.exit(1);
  } finally {
    // Close the MongoDB connection
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the script
fetchAllDonationIds();
