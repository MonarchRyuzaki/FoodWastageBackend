import { createFoodWastageSparqlClient } from "./SparqlClient.js";

// Cache the client instance to avoid recreating it on every call
let client;
function getClient() {
  if (!client) {
    client = createFoodWastageSparqlClient();
  }
  return client;
}

export async function searchDonations({
  ngoLat,
  ngoLong,
  maxDistanceKm = 10,
  status = ["Available"],
  priority = ["High", "Medium", "Low"],
  prefersFoodType = [],
  rejectsFoodType = [],
  avoidsAllergens = [],
  limit = 20, // Default to pagination size
  offset = 0, // Add offset for pagination
}) {
  // Input validation
  if (maxDistanceKm <= 0) {
    throw new Error("maxDistanceKm must be positive");
  }
  if (limit <= 0 || limit > 50) {
    throw new Error("limit must be between 1 and 50");
  }
  if (offset < 0) {
    throw new Error("offset must be non-negative");
  }

  // Normalize inputs to arrays
  const statusList = Array.isArray(status) ? status : [status];
  const priorityList = Array.isArray(priority) ? priority : [priority];
  const prefersList = Array.isArray(prefersFoodType) ? prefersFoodType : [];
  const rejectsList = Array.isArray(rejectsFoodType) ? rejectsFoodType : [];
  const avoidsList = Array.isArray(avoidsAllergens) ? avoidsAllergens : [];

  // Build optimized query parts
  const hasLocation = ngoLat != null && ngoLong != null;

  // Core WHERE patterns - most selective patterns first
  const wherePatterns = [
    "?donation a :FoodDonation ;",
    "          :hasDonationStatus ?status ;",
    "          :hasPriority       ?priority .",
  ];

  // Add optional patterns only when needed
  if (hasLocation) {
    wherePatterns.push(
      "?donation geo:lat  ?lat ;",
      "          geo:long ?long .",
      `BIND(omgeo:distance(?lat, ?long, ${ngoLat}, ${ngoLong}) AS ?distanceKm)`
    );
  }

  // Only bind food type if we need it for preferences or rejections
  if (prefersList.length > 0 || rejectsList.length > 0) {
    wherePatterns.push("?donation :hasFoodType ?foodType .");
  }

  // Only bind allergens if we need to avoid them
  if (avoidsList.length > 0) {
    wherePatterns.push("?donation :containsAllergen ?allergen .");
  }

  // Always include expiry for potential future filtering
  wherePatterns.push("?donation :hasExpiryDate ?expiry .");

  // Build value constraints (most selective first)
  const valueConstraints = [];
  if (statusList.length > 0) {
    valueConstraints.push(
      `VALUES ?status { ${statusList.map((s) => `:${s}`).join(" ")} }`
    );
  }
  if (priorityList.length > 0) {
    valueConstraints.push(
      `VALUES ?priority { ${priorityList.map((p) => `:${p}`).join(" ")} }`
    );
  }

  // Build filters
  const filters = [];

  // Distance filter using the bound variable
  if (hasLocation) {
    filters.push(`FILTER(?distanceKm <= ${maxDistanceKm})`);
  }

  // Exclusion filters using MINUS (more efficient than FILTER NOT EXISTS)
  const minusClauses = [];
  if (rejectsList.length > 0) {
    const rejectsValues = rejectsList.map((t) => `:${t}`).join(" ");
    minusClauses.push(`
      MINUS {
        ?donation :hasFoodType ?rejectedType .
        VALUES ?rejectedType { ${rejectsValues} }
      }`);
  }

  if (avoidsList.length > 0) {
    const avoidsValues = avoidsList.map((a) => `:${a}`).join(" ");
    minusClauses.push(`
      MINUS {
        ?donation :containsAllergen ?avoidedAllergen .
        VALUES ?avoidedAllergen { ${avoidsValues} }
      }`);
  }

  // Build SELECT clause
  let selectClause = "SELECT DISTINCT ?donation";
  if (hasLocation) {
    selectClause += ` ?distanceKm`;
  }

  // OPTIMIZATION: Use larger SPARQL limit but still bounded
  // We fetch more from GraphDB than needed to account for sorting preferences
  const sparqlLimit = Math.min(limit * 3, 100); // Fetch 3x what we need, max 100

  // Construct the complete SPARQL query
  const sparql = `
    PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>
    PREFIX omgeo: <http://www.ontotext.com/owlim/geo#>
    
    ${selectClause}
    WHERE {
      ${wherePatterns.join("\n      ")}
      
      ${valueConstraints.join("\n      ")}
      
      ${filters.join("\n      ")}
      
      ${minusClauses.join("\n      ")}
    }
    LIMIT ${sparqlLimit}
  `.trim();

  try {
    const { results } = await getClient().query(sparql);
    return { results: results.bindings, totalFetched: results.bindings.length };
  } catch (error) {
    console.error("SPARQL query failed:", error);
    console.error("Query:", sparql);
    throw new Error(`Failed to search donations: ${error.message}`);
  }
}
