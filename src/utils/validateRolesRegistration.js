import Joi from "joi";
import mongoose from "mongoose";

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
const validateEventHost = (data) => {
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

export default validateEventHost;
