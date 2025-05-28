/**
 * Extracts the mongo ID from the donation URI and parses the distanceKm.
 *
 * @param {Object|Array} data - A result object or an array of result objects from the SPARQL query.
 * @returns {Array|Object} An array of objects (or a single object) containing the mongoId and distanceKm.
 */
function extractDonationData(data) {
  const extract = (resultRow) => {
    // Get the donation URI and take the substring after the '#'
    const donationUri = resultRow.donation.value;
    const mongoId = donationUri.substring(donationUri.lastIndexOf("#") + 1);
    // Parse the distanceKm as a number.
    const distanceKm = parseFloat(resultRow.distanceKm.value);
    return { mongoId, distanceKm };
  };

  if (Array.isArray(data)) {
    return data.map(extract);
  } else {
    return extract(data);
  }
}

export default extractDonationData;
