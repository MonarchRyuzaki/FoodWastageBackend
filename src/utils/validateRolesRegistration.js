import Joi from "joi";
import { allergens, foodTypes } from "./foodEnums.js";

// Donor Validation
export const validateDonor = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(100).required().messages({
      "string.empty": "Name is required.",
      "string.min": "Name must be at least 3 characters.",
      "string.max": "Name cannot exceed 100 characters.",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Invalid email format.",
      "any.required": "Email is required.",
    }),
    password: Joi.string().min(8).max(20).required().messages({
      "string.empty": "Password is required.",
      "string.min": "Password must be at least 8 characters.",
      "string.max": "Password cannot exceed 20 characters.",
    }),
    phone: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .required()
      .messages({
        "string.pattern.base": "Phone number must be exactly 10 digits.",
        "any.required": "Phone number is required.",
      }),
    address: Joi.string().max(200).required().messages({
      "string.empty": "Address is required.",
      "string.max": "Address cannot exceed 200 characters.",
    }),
    city: Joi.string().max(50).required().messages({
      "string.empty": "City is required.",
      "string.max": "City cannot exceed 50 characters.",
    }),
    state: Joi.string().max(20).required().messages({
      "string.empty": "State is required.",
      "string.max": "State cannot exceed 20 characters.",
    }),
  });

  return schema.validate(data);
};
export const validateNGO = (data) => {
  const schema = Joi.object({
    registrationNumber: Joi.string().required().messages({
      "string.empty": "Registration number is required.",
    }),
    registrationProof: Joi.object({
      url: Joi.string()
        .uri()
        .required()
        .pattern(/^https?:\/\/.*\.(jpg|jpeg|png|pdf)$/)
        .messages({
          "string.pattern.base":
            "registrationProof URL must be a valid URL pointing to a JPG, JPEG, PNG, or PDF.",
          "any.required": "ID Proof URL is required.",
        }),
      public_id: Joi.string().required().messages({
        "any.required": "ID Proof public_id is required.",
      }),
    }),
    password: Joi.string().min(8).max(20).required().messages({
      "string.empty": "Password is required.",
      "string.min": "Password must be at least 8 characters.",
      "string.max": "Password cannot exceed 20 characters.",
    }),
    name: Joi.string().min(3).max(100).required().messages({
      "string.empty": "NGO name is required.",
      "string.min": "NGO name must be at least 3 characters.",
      "string.max": "NGO name cannot exceed 100 characters.",
    }),
    cause: Joi.string().min(3).max(200).required().messages({
      "string.empty": "Cause is required.",
      "string.min": "Cause must be at least 3 characters.",
      "string.max": "Cause cannot exceed 200 characters.",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Invalid email format.",
      "any.required": "Email is required.",
    }),
    phone: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .required()
      .messages({
        "string.pattern.base": "Phone number must be exactly 10 digits.",
        "any.required": "Phone number is required.",
      }),
    address: Joi.string().max(200).required().messages({
      "string.empty": "Address is required.",
      "string.max": "Address cannot exceed 200 characters.",
    }),
    city: Joi.string().max(50).required().messages({
      "string.empty": "City is required.",
      "string.max": "City cannot exceed 50 characters.",
    }),
    state: Joi.string().max(20).required().messages({
      "string.empty": "State is required.",
      "string.max": "State cannot exceed 20 characters.",
    }),
    description: Joi.string().max(500).required().messages({
      "string.empty": "Description is required.",
      "string.max": "Description cannot exceed 500 characters.",
    }),
    prefersFoodType: Joi.alternatives()
      .try(
        Joi.string().custom((value, helpers) => {
          console.log("Validating prefersFoodType:", value);
          const items = value.split(",");
          const invalid = items.filter((item) => !foodTypes.includes(item));
          if (invalid.length) {
            return helpers.error("any.invalid", { invalid });
          }
          return items;
        })
      )
      .messages({
        "array.base": "Prefers food type must be an array.",
        "any.invalid":
          "Prefers food type must be a JSON array string, comma-separated values, or multiple values. Invalid values: {{#invalid}}",
      }),
    rejectsFoodType: Joi.alternatives()
      .try(
        Joi.array().items(...foodTypes),
        Joi.string().custom((value, helpers) => {
          try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
              const invalid = parsed.filter(
                (item) => !foodTypes.includes(item)
              );
              if (invalid.length) {
                return helpers.error("any.invalid", { invalid });
              }
              return parsed;
            }
          } catch (e) {}
          const items = value
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item);
          const invalid = items.filter((item) => !foodTypes.includes(item));
          if (invalid.length) {
            return helpers.error("any.invalid", { invalid });
          }
          return items;
        })
      )
      .messages({
        "array.base": "Rejects food type must be an array.",
        "any.invalid":
          "Rejects food type must be a JSON array string, comma-separated values, or multiple values. Invalid values: {{#invalid}}",
      }),

    avoidsAllergen: Joi.alternatives()
      .try(
        Joi.array().items(...allergens),
        Joi.string().custom((value, helpers) => {
          try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
              const invalid = parsed.filter(
                (item) => !allergens.includes(item)
              );
              if (invalid.length) {
                return helpers.error("any.invalid", { invalid });
              }
              return parsed;
            }
          } catch (e) {}
          const items = value
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item);
          const invalid = items.filter((item) => !allergens.includes(item));
          if (invalid.length) {
            return helpers.error("any.invalid", { invalid });
          }
          return items;
        })
      )
      .messages({
        "array.base": "Avoids allergen must be an array.",
        "any.invalid":
          "Avoids allergen must be a JSON array string, comma-separated values, or multiple values. Invalid values: {{#invalid}}",
      }),
  });

  return schema.validate(data);
};
