import { createFoodWastageSparqlClient } from "./SparqlClient.js";

const client = createFoodWastageSparqlClient();

export const insertNewDonor = async ({ mongoID }) => {
  const query = `  
    INSERT DATA {
      :${mongoID} a :Donor ;
    }
  `;

  try {
    await client.update(query);
    console.log("Data inserted successfully");
  } catch (error) {
    console.error("Error executing query:", error);
  }
};
