import { createFoodWastageSparqlClient } from "./SparqlClient.js";

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
