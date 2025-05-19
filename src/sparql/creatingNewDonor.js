import { createFoodWastageSparqlClient } from "./SparqlClient.js";

const client = createFoodWastageSparqlClient();

const insertNewDonor = async ({ mongoID, latitude, longitude }) => {
  const locationIRI = `:${mongoID}_Location`;

  const query = `  

    INSERT DATA {
    PREFIX geo:     <http://www.w3.org/2003/01/geo/wgs84_pos#>
      # Create the Donor individual, typed as :Donor (subclass of :User)
      :${mongoID} a :Donor ;
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

await insertNewDonor({
  mongoID: "xyz1234",
  latitude: 12.9716,
  longitude: 77.5946,
});
