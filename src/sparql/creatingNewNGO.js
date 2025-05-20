import { createFoodWastageSparqlClient } from "./SparqlClient.js";

const client = createFoodWastageSparqlClient();

export const insertNewNGO = async ({
  mongoID,
  prefersFoodType = [],
  rejectsFoodType = [],
  avoidsAllergen = [],
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

  const query = `  

    INSERT DATA {
      # Create the NGO individual, typed as :NGO (subclass of :User)
      :${mongoID} a :NGO ; ${prefClause} ${rejectClause} ${avoidClause}
   }
  `;

  try {
    await client.update(query);
    console.log("Data inserted successfully");
  } catch (error) {
    console.error("Error executing query:", error);
  }
};