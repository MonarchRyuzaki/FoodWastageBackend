import { createFoodWastageClient } from "./sparqlClient";

export async function searchDonations({
  ngoIri,
  maxDistanceKm = 10,
  status, // e.g. ['Open','Closed']
  priority, // e.g. ['High','Low']
  donor, // e.g. ['DonorA','DonorB']
  // …any other filters…
}) {
  // 1. Load NGO prefs first
  const ngoQuery = `
    PREFIX : <http://.../FoodWastageOntology#>
    SELECT ?prefType ?rejectType ?avoidAllergen ?ngoLat ?ngoLong WHERE {
      VALUES ?ngo { <${ngoIri}> }
      OPTIONAL { ?ngo :prefersFoodType   ?prefType }
      OPTIONAL { ?ngo :rejectsFoodType   ?rejectType }
      OPTIONAL { ?ngo :avoidsAllergen    ?avoidAllergen }
      ?ngo :ngoHasLocation ?ngoLoc .
      ?ngoLoc :hasLatitude  ?ngoLat ;
              :hasLongitude ?ngoLong .
    }
  `;
  const { results: ngoRes } = await createFoodWastageClient().query(ngoQuery);
  const preferred = new Set(),
    rejected = new Set(),
    avoided = new Set();
  let ngoLat, ngoLong;
  for (const b of ngoRes.bindings) {
    if (b.prefType) preferred.add(b.prefType.value.split("#").pop());
    if (b.rejectType) rejected.add(b.rejectType.value.split("#").pop());
    if (b.avoidAllergen) avoided.add(b.avoidAllergen.value.split("#").pop());
    if (b.ngoLat) ngoLat = parseFloat(b.ngoLat.value);
    if (b.ngoLong) ngoLong = parseFloat(b.ngoLong.value);
  }

  // 2. Build the WHERE & FILTER clauses
  const where = [
    "?donation  a :FoodDonation .",
    "?donation  :hasFoodType      ?foodType .",
    "?donation  :containsAllergen ?allergen .",
    "?donation  :hasDonated       ?donor .",
    "?donation  :hasDonationStatus ?status .",
    "?donation  :hasPriority      ?priority .",
    "?donation  :hasLocation      ?loc .",
    "?loc       :hasLatitude      ?lat .",
    "?loc       :hasLongitude     ?long .",
  ];

  // always exclude rejected / avoided
  const filter = [
    `FILTER NOT EXISTS { VALUES ?foodType { ${[...rejected]
      .map((t) => `:${t}`)
      .join(" ")} } }`,
    `FILTER NOT EXISTS { VALUES ?allergen  { ${[...avoided]
      .map((a) => `:${a}`)
      .join(" ")} } }`,
    // distance calculation (GeoSPARQL or custom extension):
    `BIND(geof:distance(geof:point(?long ?lat), geof:point(${ngoLong} ${ngoLat}), uom:kilometer) AS ?distKm)`,
    `FILTER(?distKm <= ${maxDistanceKm})`,
  ];

  // inject user-supplied filters
  if (status?.length)
    filter.push(`VALUES ?status   { ${status.map((s) => `:${s}`).join(" ")} }`);
  if (priority?.length)
    filter.push(
      `VALUES ?priority { ${priority.map((p) => `:${p}`).join(" ")} }`
    );
  if (donor?.length)
    filter.push(`VALUES ?donor    { ${donor.map((d) => `:${d}`).join(" ")} }`);
  // …and so on for any other dims…

  // 3. ORDER BY: preferred first, then neutral
  //    We use a small expression: preferred?0 : 1
  const orderExpr = [
    `IF( ?foodType IN ( ${[...preferred]
      .map((t) => `:${t}`)
      .join(" , ")} ), 0, 1 )`,
    "?distKm", // then by nearest
  ].join(" , ");

  // 4. Assemble final query
  const sparql = `
    PREFIX :     <http://.../FoodWastageOntology#>
    PREFIX geof:  <http://www.opengis.net/def/function/geosparql/>
    PREFIX uom:   <http://www.opengis.net/def/uom/OGC/1.0/>
    
    SELECT 
      ?donation ?foodType ?allergen ?donor ?status ?priority ?lat ?long ?distKm
    WHERE {
      ${where.join("\n         ")}
      ${filter.join("\n         ")}
    }
    ORDER BY (${orderExpr})
    LIMIT 100
  `;

  const { results } = await createFoodWastageClient().query(sparql);
  return results.bindings;
}

// app.get('/search', async (req, res) => {
//     const results = await searchDonations({
//       ngoIri: req.query.ngoIri,
//       maxDistanceKm: parseFloat(req.query.maxDist) || 10,
//       status:    req.query.status?.split(','),
//       priority:  req.query.priority?.split(','),
//       donor:     req.query.donor?.split(','),
//       // …etc…
//     });
//     res.json(results);
//   });

// // 1. Insert new Donation in Mongo, get its _id
// const { insertedId } = await donations.insertOne({ …payload… });

// // 2. Push to GraphDB
// await sparqlClient.update(`
//   PREFIX : <http://…/FoodWastageOntology#>
//   INSERT DATA {
//     :donation_${insertedId} a :FoodDonation ;
//       :donationMongoID "${insertedId}" ;
//       :hasFoodType :Meat ;
//       … other props …
//   }
// `);

// // 3. Later, run your reasoning-driven search…
// const bindings = await sparqlClient.query( yourDynamicSearchQuery );
// // e.g. bindings = [ { mongoID: { value: "605c72f4a3" } }, … ]

// // 4. Bulk-fetch from Mongo by ID
// const ids = bindings.map(b => b.mongoID.value);
// const docs = await donations.find({ _id: { $in: ids.map(ObjectId) }}).toArray();
