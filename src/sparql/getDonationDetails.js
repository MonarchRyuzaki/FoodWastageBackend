import { createFoodWastageSparqlClient } from "./SparqlClient.js";
const client = createFoodWastageSparqlClient();

/**
 * Retrieves the distance from the NGO to a specific donation based on its mongoID.
 *
 * @param {Object} params - The input parameters.
 * @param {string} params.mongoId - The Mongo ID of the donation.
 * @param {number|string} params.ngoLat - The latitude of the NGO.
 * @param {number|string} params.ngoLong - The longitude of the NGO.
 * @returns {Promise<number|null>} The distance in kilometers or null if not found.
 */
export async function getDonationDistance({ mongoId, ngoLat, ngoLong }) {
  // Construct the full donation URI using the mongoId.
  const donationUri = `http://www.semanticweb.org/ryuzaki/ontologies/2025/4/FoodWastageOntology#${mongoId}`;

  const sparql = `
    PREFIX geo:     <http://www.w3.org/2003/01/geo/wgs84_pos#>
    PREFIX omgeo:   <http://www.ontotext.com/owlim/geo#>
    
    SELECT ( omgeo:distance(?lat, ?long, ${ngoLat}, ${ngoLong}) AS ?distanceKm )
    WHERE {
      VALUES ?donation { <${donationUri}> }
      ?donation geo:lat ?lat .
      ?donation geo:long ?long.
    }
    LIMIT 1
  `;

  const { results } = await client.query(sparql);
  console.log("SPARQL Query Results:", results);
  if (results.bindings && results.bindings.length) {
    // Parse and return the distance.
    return parseFloat(results.bindings[0].distanceKm.value);
  }
  return null;
}
