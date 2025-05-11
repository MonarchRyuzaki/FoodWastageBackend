import { createFoodWastageSparqlClient } from "./SparqlClient.js";


const client = createFoodWastageSparqlClient();

const runQuery = async () => {
    const query = `
    SELECT ?donation ?expiryDate
    WHERE {
        ?donation a :FoodDonation ;
                    :hasExpiryDate ?expiryDate .

        FILTER (
            ?expiryDate <= "2025-05-12T00:00:00"^^xsd:dateTime
        )
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
