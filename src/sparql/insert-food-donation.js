import { createFoodWastageSparqlClient } from "./SparqlClient.js";

const client = createFoodWastageSparqlClient();

const insertData = async () => {
  const query = `
      PREFIX ontogeo: <http://www.ontotext.com/owlim/geo#>
      INSERT DATA { _:b1 ontogeo:createIndex _:b2. }
    `;

  // const query = `
  //     INSERT DATA {
  //       :FoodDonation10 a :FoodDonation ;
  //         :hasFoodType :FreshProduce ;
  //         :donatedBy :Donor10 ;
  //         :hasPriority :High ;
  //         :hasDonationStatus :Available .
  //     }
  //   `;
  try {
    await client.update(query);
    console.log("Data inserted successfully");
  } catch (error) {
    console.error("Error executing query:", error);
  }
};

insertData();
