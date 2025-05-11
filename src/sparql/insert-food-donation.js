import { createFoodWastageSparqlClient } from "./SparqlClient.js";


const client = createFoodWastageSparqlClient();

const insertData = async () => {
    const query = `
      INSERT DATA {
        :FoodDonation10 a :FoodDonation ;
          :hasFoodType :FreshProduce ;
          :donatedBy :Donor10 ;
          :hasPriority :High ;
          :hasDonationStatus :Available .
      }
    `;

    try {
        await client.update(query);
        console.log("Data inserted successfully");
    } catch (error) {
        console.error("Error executing query:", error);
    }
};

insertData();
