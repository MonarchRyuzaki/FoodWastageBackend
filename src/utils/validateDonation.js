import validator from "validator";

export const validateDonationData = (data) => {
  const errors = [];

  if (!data.title || data.title.length < 5 || data.title.length > 100) {
    errors.push("Title must be between 5 and 100 characters.");
  }

  if (data.description && data.description.length > 500) {
    errors.push("Description should not exceed 500 characters.");
  }

  if (!data.location) {
    errors.push("Location is required.");
  }

  if (!data.quantity) {
    errors.push("Quantity is required.");
  }

  if (!data.expiry_date || !validator.isISO8601(data.expiry_date)) {
    errors.push("Valid expiry date is required.");
  } else {
    const expiryDate = new Date(data.expiry_date);
    const now = new Date();
    const maxExpiryTime = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    if (expiryDate < now || expiryDate > maxExpiryTime) {
      errors.push("Expiry date should not exceed 48 hours from creation time.");
    }
  }

  return errors;
};
