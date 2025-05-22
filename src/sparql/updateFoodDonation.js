import { createFoodWastageSparqlClient } from "./SparqlClient.js";

const client = createFoodWastageSparqlClient();

/**
 * Update an existing FoodDonation (identified by mongoID).
 * Only these fields can change:
 *   - containsAllergen (array of Allergen names)
 *   - hasFoodType      (array of FoodType names)
 *   - hasExpiryDate    (xsd:date string)
 *   - donatedBy        (donorMongoID string)
 *   - hasDonationStatus (string, e.g. "Available", "Claimed", etc.)
 *   - hasPriority      (string, e.g. "High", "Medium", "Low")
 *
 * Latitude/Longitude (geo:lat/geo:long) are never changed here.
 */
export async function updateFoodDonation({
  mongoID,
  containsAllergen = null, // pass null if you don’t want to change
  hasFoodType = null, // pass null if you don’t want to change
  hasExpiryDate = null, // pass null if you don’t want to change
}) {
  const donationIRI = `:${mongoID}`;
  const donorIRI = donorMongoID ? `:${donorMongoID}_Donor` : null;

  // Build DELETE patterns and INSERT patterns conditionally:
  let deletePatterns = [];
  let insertPatterns = [];

  // 1) containsAllergen
  if (Array.isArray(containsAllergen)) {
    // Delete any existing containsAllergen triples, then insert new ones
    deletePatterns.push(`${donationIRI} :containsAllergen ?oldAllergen .`);
    if (containsAllergen.length > 0) {
      const allergenList = containsAllergen.map((a) => `:${a}`).join(", ");
      insertPatterns.push(`${donationIRI} :containsAllergen ${allergenList} .`);
    }
  }

  // 2) hasFoodType
  if (Array.isArray(hasFoodType)) {
    deletePatterns.push(`${donationIRI} :hasFoodType ?oldFoodType .`);
    if (hasFoodType.length > 0) {
      const foodTypeList = hasFoodType.map((f) => `:${f}`).join(", ");
      insertPatterns.push(`${donationIRI} :hasFoodType ${foodTypeList} .`);
    }
  }

  // 3) hasExpiryDate
  if (typeof hasExpiryDate === "string") {
    deletePatterns.push(`${donationIRI} :hasExpiryDate ?oldExpiryDate .`);
    if (hasExpiryDate) {
      insertPatterns.push(
        `${donationIRI} :hasExpiryDate "${hasExpiryDate}"^^xsd:date .`
      );
    }
  }

  // If nothing to update, return early
  if (deletePatterns.length === 0 && insertPatterns.length === 0) {
    console.log("No fields provided for update; skipping SPARQL.");
    return;
  }

  // Build the SPARQL-UPDATE
  const query = `

    DELETE {
      ${deletePatterns.join("\n      ")}
    }
    INSERT {
      ${insertPatterns.join("\n      ")}
    }
    WHERE {
      ${deletePatterns.join("\n      ")}
      # AWS: if any deletePatterns rely on optional triples, wrap them accordingly:
      # OPTIONAL { ${deletePatterns.join(" ")} }
    }
  `;

  try {
    await client.update(query);
    console.log(`FoodDonation ${mongoID} updated successfully.`);
  } catch (err) {
    console.error(
      "Error updating FoodDonation:",
      err.response?.data || err.message
    );
    throw err;
  }
}

