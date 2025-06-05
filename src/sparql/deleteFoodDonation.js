import mongoose from "mongoose";
import FoodDonation from "../models/FoodDonation.js";
import { createFoodWastageSparqlClient } from "./SparqlClient.js";
import dotenv from "dotenv";
dotenv.config({path: "../../.env"});

const client = createFoodWastageSparqlClient();

/**
 * Delete a FoodDonation and all its triples (except we leave donors intact).
 * This removes any triple whose subject is :<mongoID> (including geo:lat/long).
 */
export async function deleteFoodDonation({ mongoID }) {
  const donationIRI = `:${mongoID}`;

  const query = `
    DELETE WHERE {
      ${donationIRI} ?p ?o .
    }
  `;

  try {
    await client.update(query);
    console.log(`FoodDonation ${mongoID} deleted successfully.`);
  } catch (err) {
    console.error(
      "Error deleting FoodDonation:",
      err.response?.data || err.message
    );
    throw err;
  }
}

/**
 * Delete only those donations from GraphDB that don't exist in MongoDB.
 * This keeps the databases in sync by preserving donations that exist in both.
 */
export async function deleteOrphanedGraphDonations() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to MongoDB for cleanup");

    // Get all donation IDs from MongoDB (source of truth)
    const mongoDBDonations = await FoodDonation.find({}, { _id: 1 })
      .lean()
      .exec();
    const mongoDBIds = new Set(
      mongoDBDonations.map((donation) => donation._id.toString())
    );

    console.log(`Found ${mongoDBIds.size} donations in MongoDB`);

    // Get all donation IDs from GraphDB
    const sparqlQuery = `
      SELECT DISTINCT ?donation WHERE {
        ?donation a :FoodDonation .
      }
    `;

    const { results } = await client.query(sparqlQuery);
    const graphDBIds = results.bindings.map((binding) => {
      const donationUri = binding.donation.value;
      // Extract the ID from the URI (assuming format: ...#mongoID)
      return donationUri.substring(donationUri.lastIndexOf("#") + 1);
    });

    console.log(`Found ${graphDBIds.length} donations in GraphDB`);

    // Find orphaned donations (exist in GraphDB but not in MongoDB)
    const orphanedIds = graphDBIds.filter(
      (graphId) => !mongoDBIds.has(graphId)
    );

    console.log(
      `Found ${orphanedIds.length} orphaned donations to delete from GraphDB`
    );

    if (orphanedIds.length === 0) {
      console.log(
        "✅ No orphaned donations found. Graph and MongoDB are in sync."
      );
      return { deleted: 0, total: graphDBIds.length };
    }

    // Delete orphaned donations from GraphDB
    let deletedCount = 0;
    const errors = [];

    for (const orphanedId of orphanedIds) {
      try {
        await deleteFoodDonation({ mongoID: orphanedId });
        deletedCount++;
        console.log(`✓ Deleted orphaned donation: ${orphanedId}`);
      } catch (err) {
        console.error(
          `✗ Failed to delete orphaned donation ${orphanedId}:`,
          err.message
        );
        errors.push({ id: orphanedId, error: err.message });
      }
    }

    console.log(
      `\n🧹 Cleanup completed: ${deletedCount}/${orphanedIds.length} orphaned donations deleted`
    );

    if (errors.length > 0) {
      console.log(`⚠️  ${errors.length} errors occurred during cleanup`);
    }

    return {
      deleted: deletedCount,
      total: orphanedIds.length,
      errors: errors.length,
      remaining: graphDBIds.length - deletedCount,
    };
  } catch (err) {
    console.error("Error during cleanup operation:", err);
    throw err;
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}
