import { createFoodWastageSparqlClient } from "./SparqlClient.js";


const client = createFoodWastageSparqlClient();

const runQuery = async () => {
    const query = `
    SELECT ?donation ?mongoID
    WHERE { 
        ?donation rdf:type :FoodDonation ; :hasFoodType :Meat; :donationMongoID ?mongoID        
        }
        `;

    try {
        const response = await client.query(query);
        console.log("Query Results:", response.results.bindings);
    } catch (error) {
        console.error("Error executing query:", error);
    }
};

runQuery();
