import { createFoodWastageSparqlClient } from "./SparqlClient.js";
const client = createFoodWastageSparqlClient();

export async function searchDonations({
  ngoLat,
  ngoLong,
  maxDistanceKm = 10,
  status = ["Available"],
  priority = ["High", "Medium", "Low"],
  prefersFoodType = [],
  rejectsFoodType = [],
  avoidsAllergens = [],
}) {
  const statusList = Array.isArray(status) ? status : [status];
  const priorityList = Array.isArray(priority) ? priority : [priority];

  const where = [
    "?donation a :FoodDonation ;",
    "          :hasFoodType       ?foodType ;",
    "          :containsAllergen  ?allergen ;",
    "          :hasDonationStatus ?status ;",
    "          :hasExpiryDate     ?expiry ;",
    "          :hasPriority       ?priority ;",
    "          geo:lat            ?lat ;",
    "          geo:long           ?long .",
  ];

  const exclude = [];
  if (rejectsFoodType.length) {
    const rejectsList = rejectsFoodType.map((t) => `:${t}`).join(" ");
    exclude.push(`
      FILTER NOT EXISTS {
        ?donation :hasFoodType ?ft .
        VALUES ?ft { ${rejectsList} }
      }
    `);
  }
  if (avoidsAllergens.length) {
    const avoidsList = avoidsAllergens.map((a) => `:${a}`).join(" ");
    exclude.push(`
      FILTER NOT EXISTS {
        ?donation :containsAllergen ?a .
        VALUES ?a { ${avoidsList} }
      }
    `);
  }
  let distanceClause = "";
  if (ngoLat && ngoLong) {
    distanceClause = `FILTER(?distanceKm <= ${maxDistanceKm}) .`;
  } 

  const valueFilters = [];
  if (statusList.length) {
    valueFilters.push(
      `VALUES ?status { ${statusList.map((s) => `:${s}`).join(" ")} }`
    );
  }
  if (priorityList.length) {
    valueFilters.push(
      `VALUES ?priority { ${priorityList.map((p) => `:${p}`).join(" ")} }`
    );
  }

  // Preference ordering: preferred types first, then distance
  let orderExpr = (ngoLat && ngoLong) ? "?distanceKm" : "";
  if (prefersFoodType.length) {
    const cond = prefersFoodType.map((t) => `?foodType = :${t}`).join(" || ");
    orderExpr = `IF(${cond}, 0, 1) ${orderExpr}`;
  }

  const sparql = `
    PREFIX geo:     <http://www.w3.org/2003/01/geo/wgs84_pos#>
    PREFIX omgeo: <http://www.ontotext.com/owlim/geo#>

    SELECT DISTINCT
      ?donation ( omgeo:distance(?lat, ?long, ${ngoLat}, ${ngoLong}) AS ?distanceKm )
    WHERE {
      ${where.join("\n      ")}
      ${distanceClause}
      ${valueFilters.join("\n      ")}
      ${exclude.join("\n      ")}
      }
      ORDER BY ${orderExpr}
      LIMIT 100
      `;

  const { results } = await client.query(sparql);
  return results.bindings;
}