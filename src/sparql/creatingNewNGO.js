import { createFoodWastageSparqlClient } from "./SparqlClient.js";

const client = createFoodWastageSparqlClient();

const insertNewNGO = async ({
  mongoID,
  prefersFoodType = [],
  rejectsFoodType = [],
  avoidsAllergen = [],
  latitude,
  longitude,
}) => {
  const prefList = prefersFoodType.map((ft) => `:${ft}`).join(", ");
  const rejectList = rejectsFoodType.map((ft) => `:${ft}`).join(", ");
  const avoidList = avoidsAllergen.map((a) => `:${a}`).join(", ");

  const prefClause = prefersFoodType.length
    ? `  :prefersFoodType   ${prefList} ;`
    : ``;
  const rejectClause = rejectsFoodType.length
    ? `  :rejectsFoodType   ${rejectList} ;`
    : ``;
  const avoidClause = avoidsAllergen.length
    ? `  :avoidsAllergen    ${avoidList} ;`
    : ``;

  const locationIRI = `:${mongoID}_Location`;

  const query = `  

    INSERT DATA {
      PREFIX geo:     <http://www.w3.org/2003/01/geo/wgs84_pos#>
      # Create the NGO individual, typed as :NGO (subclass of :User)
      :${mongoID} a :NGO ; ${prefClause} ${rejectClause} ${avoidClause}
      geo:lat           "${latitude}"^^xsd:decimal ;
      geo:long          "${longitude}"^^xsd:decimal .
   }
  `;

  try {
    await client.update(query);
    console.log("Data inserted successfully");
  } catch (error) {
    console.error("Error executing query:", error);
  }
};

await insertNewNGO({
  mongoID: "abc1234",
  prefersFoodType: ["Meat", "Fruit"],
  rejectsFoodType: ["Dairy"],
  avoidsAllergen: ["Peanut", "Gluten"],
  latitude: 12.9816,
  longitude: 77.6946,
});
