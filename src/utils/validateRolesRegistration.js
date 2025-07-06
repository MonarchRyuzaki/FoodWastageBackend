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
  });

  return schema.validate(data);
};
