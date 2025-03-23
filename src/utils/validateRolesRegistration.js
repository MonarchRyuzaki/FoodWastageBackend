import Joi from "joi";
import mongoose from "mongoose";

// Farmer Validation
export const validateFarmer = (data) => {
  const schema = Joi.object({
    userId: Joi.string()
      .required()
      .custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return helpers.message("Invalid userId. Must be a valid ObjectId.");
        }
        return value;
      }),
    farmName: Joi.string().min(3).max(100).required(),
    farmAddress: Joi.string().min(5).max(200).required(),
    farmSize: Joi.number().positive().required(),
    farmType: Joi.array()
      .items(
        Joi.string().valid(
          "Organic",
          "Dairy",
          "Aquaculture",
          "Poultry",
          "Horticulture"
        )
      )
      .required(),
    idProof: Joi.string()
      .uri()
      .required()
      .pattern(new RegExp(/^https?:\/\/.*\.(jpg|jpeg|png)$/))
      .message(
        "idProof must be a valid URL pointing to an image (JPG, JPEG, PNG)."
      ),

    cropsGrown: Joi.array().items(Joi.string().max(50)).optional(),
    yearsOfExperience: Joi.number().min(0).max(100).optional(),
    verified: Joi.boolean().optional(),
  });

  return schema.validate(data);
};

// Event Host Validation
export const validateEventHost = (data) => {
  const schema = Joi.object({
    userId: Joi.string().required().messages({
      "any.required": "User ID is required.",
    }),
    organization: Joi.string().min(3).max(100).required().messages({
      "string.empty": "Organization name cannot be empty.",
      "string.min": "Organization name must be at least 3 characters.",
      "string.max": "Organization name cannot exceed 100 characters.",
    }),
    phone: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .required()
      .messages({
        "string.pattern.base": "Phone number must be exactly 10 digits.",
        "any.required": "Phone number is required.",
      }),
    email: Joi.string().email().required().messages({
      "string.email": "Invalid email format.",
      "any.required": "Email is required.",
    }),
    address: Joi.string().max(200).required().messages({
      "string.empty": "Address cannot be empty.",
      "string.max": "Address cannot exceed 200 characters.",
    }),
    city: Joi.string().required().messages({
      "string.empty": "City is required.",
    }),
    state: Joi.string().required().messages({
      "string.empty": "State is required.",
    }),
    zip: Joi.string()
      .pattern(/^\d{6}$/)
      .required()
      .messages({
        "string.pattern.base": "ZIP code must be exactly 6 digits.",
        "any.required": "ZIP code is required.",
      }),
    idProof: Joi.string()
      .uri()
      .required()
      .pattern(/^https?:\/\/.*\.(jpg|jpeg|png)$/)
      .messages({
        "string.pattern.base":
          "idProof must be a valid URL pointing to a JPG, JPEG, PNG, or PDF.",
        "any.required": "ID Proof is required.",
      }),
    status: Joi.string()
      .valid("pending", "approved", "rejected")
      .default("pending")
      .messages({
        "any.only": "Status must be one of: pending, approved, or rejected.",
      }),
  });

  return schema.validate(data);
};

// NGO Validation
export const validateNGO = (data) => {
  const schema = Joi.object({
    userId: Joi.string().required().messages({
      "any.required": "User ID is required.",
    }),
    registrationNumber: Joi.string().required().messages({
      "string.empty": "Registration number is required.",
    }),
    registrationProof: Joi.string()
      .uri()
      .required()
      .pattern(/^https?:\/\/.*\.(jpg|jpeg|png|pdf)$/)
      .messages({
        "string.pattern.base":
          "Registration proof must be a valid URL pointing to a JPG, JPEG, PNG, or PDF.",
        "any.required": "Registration proof is required.",
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
    description: Joi.string().max(500).required().messages({
      "string.empty": "Description is required.",
      "string.max": "Description cannot exceed 500 characters.",
    }),
    status: Joi.string()
      .valid("pending", "approved", "rejected")
      .default("pending")
      .messages({
        "any.only": "Status must be one of: pending, approved, or rejected.",
      }),
  });

  return schema.validate(data);
};
