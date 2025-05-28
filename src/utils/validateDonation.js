import Joi from "joi";
import { allergens, foodTypes } from "./foodEnums.js";

const foodDonationValidationSchema = Joi.object({
  _id: Joi.optional(),
  userId: Joi.optional(),
  status: Joi.string()
    .valid("available", "claimed", "delivered")
    .default("available")
    .messages({
      "any.only":
        'Status must be one of "available", "claimed", or "delivered".',
    }),

  foodTitle: Joi.string().min(3).max(100).required().messages({
    "any.required": "Food title is required.",
    "string.empty": "Food title cannot be empty.",
    "string.min": "Food title must be at least 3 characters.",
    "string.max": "Food title cannot exceed 100 characters.",
  }),

  foodDescription: Joi.string().min(10).max(500).required().messages({
    "any.required": "Food description is required.",
    "string.empty": "Food description cannot be empty.",
    "string.min": "Food description must be at least 10 characters.",
    "string.max": "Food description cannot exceed 500 characters.",
  }),

  foodType: Joi.array()
    .items(Joi.string().valid(...foodTypes))
    .min(1)
    .required()
    .messages({
      "array.base": "foodType must be an array of strings.",
      "array.min": "At least one foodType must be provided.",
      "any.required": "foodType is required.",
      "any.only": `Each foodType must be one of: ${foodTypes.join(", ")}.`,
      "string.base": "Each foodType must be a string.",
    }),

  containsAllergen: Joi.array()
    .items(Joi.string().valid(...allergens))
    .min(0)
    .required()
    .messages({
      "array.base": "containsAllergen must be an array of strings.",
      "array.min": "At least one allergen must be provided.",
      "any.required": "containsAllergen is required.",
      "any.only": `Each allergen must be one of: ${allergens.join(", ")}.`,
      "string.base": "Each allergen must be a string.",
    }),

  foodQuantity: Joi.number().integer().min(1).required().messages({
    "any.required": "Food quantity is required.",
    "number.base": "Food quantity must be a number.",
    "number.min": "Food quantity must be at least 1.",
  }),

  address: Joi.string().min(5).max(200).required().messages({
    "any.required": "Address is required.",
    "string.empty": "Address cannot be empty.",
    "string.min": "Address must be at least 5 characters.",
    "string.max": "Address cannot exceed 200 characters.",
  }),

  state: Joi.string().min(2).max(100).required().messages({
    "any.required": "State is required.",
    "string.empty": "State cannot be empty.",
    "string.min": "State must be at least 2 characters.",
    "string.max": "State cannot exceed 100 characters.",
  }),
  city: Joi.string().min(2).max(100).required().messages({
    "any.required": "City is required.",
    "string.empty": "City cannot be empty.",
    "string.min": "City must be at least 2 characters.",
    "string.max": "City cannot exceed 100 characters.",
  }),
  latitude: Joi.number().required().messages({
    "any.required": "Latitude is required.",
    "number.base": "Latitude must be a number.",
  }),
  longitude: Joi.number().required().messages({
    "any.required": "Longitude is required.",
    "number.base": "Longitude must be a number.",
  }),

  expiryDate: Joi.date()
    .greater("now")
    // .max(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
    .required()
    .messages({
      "any.required": "Expiry date is required.",
      "date.base": "Expiry date must be a valid date.",
      "date.greater": "Expiry date must be in the future.",
      "date.max": "Expiry date cannot be more than 2 days from now.",
    }),

  contactPhoneNumber: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "any.required": "Contact phone number is required.",
      "string.pattern.base": "Contact phone number must be exactly 10 digits.",
    }),

  contactEmail: Joi.string().email().required().messages({
    "any.required": "Contact email is required.",
    "string.email": "Contact email must be a valid email address.",
  }),

  foodImage: Joi.optional(),
  createdAt: Joi.optional(),
  updatedAt: Joi.optional(),
  __v: Joi.optional(),
});

export const validateFoodDonation = (data) => foodDonationValidationSchema.validate(data);
