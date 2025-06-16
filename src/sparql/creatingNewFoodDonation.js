import { createFoodWastageSparqlClient } from "./SparqlClient.js";

const client = createFoodWastageSparqlClient();

export const insertNewFoodDonation = async ({
  mongoID,
  containsAllergen = [],
  hasFoodType = [],
  hasExpiryDate = "",
  latitude,
  longitude,
  donorMongoID,
}) => {
  const allergenList = containsAllergen.map((a) => `:${a}`).join(", ");
  const foodTypeList = hasFoodType.map((f) => `:${f}`).join(", ");

  const allergenClause = containsAllergen.length
    ? `    :containsAllergen ${allergenList} ;`
    : "";
  const foodTypeClause = hasFoodType.length
    ? `    :hasFoodType       ${foodTypeList} ;`
    : "";
  const expiryClause = hasExpiryDate
    ? `    :hasExpiryDate    "${hasExpiryDate}"^^xsd:dateTime ;`
    : "";

  const donationIRI = `:${mongoID}`;
  const donorIRI = `:${donorMongoID}_Donor`;

  const query = `
    PREFIX geo:     <http://www.w3.org/2003/01/geo/wgs84_pos#>
    PREFIX omgeo:   <http://www.ontotext.com/owlim/geo#>

    INSERT DATA {
      # Make donation both a FoodDonation and a SpatialThing
      ${donationIRI}
        a               :FoodDonation, geo:SpatialThing ; ${allergenClause} ${foodTypeClause} ${expiryClause}
        :donatedBy         ${donorIRI} ;
        :hasDonationStatus :Available ;
        :hasPriority       :High ;
        # WGS84 coords
        geo:lat           "${latitude}"^^xsd:decimal ;
        geo:long          "${longitude}"^^xsd:decimal .

      # Donor individual
      ${donorIRI}
        a :Donor .
    }
  `;

  try {
    await client.update(query);
    console.log("FoodDonation inserted with WGS84 lat/long successfully");
  } catch (error) {
    console.error(
      "Error executing query:",
      error.response?.data || error.message
    );
  }
};
