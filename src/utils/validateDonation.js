import Joi from "joi";

const foodDonationValidationSchema = Joi.object({
  userId: Joi.string().required().messages({
    "any.required": "User ID is required.",
    "string.empty": "User ID cannot be empty.",
  }),

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

  foodType: Joi.string().valid("Veg", "Non-Veg", "Vegan").required().messages({
    "any.required": "Food type is required.",
    "any.only": 'Food type must be "Veg", "Non-Veg", or "Vegan".',
  }),

  foodQuantity: Joi.number().integer().min(1).required().messages({
    "any.required": "Food quantity is required.",
    "number.base": "Food quantity must be a number.",
    "number.min": "Food quantity must be at least 1.",
  }),

  foodImage: Joi.array()
    .items(
      Joi.object({
        url: Joi.string()
          .uri()
          .required()
          .pattern(/^https?:\/\/.*\.(jpg|jpeg|png)$/)
          .messages({
            "string.pattern.base":
              "Each food image URL must be a valid URL ending with JPG, JPEG, or PNG.",
          }),
        public_id: Joi.string().required(),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "At least one food image is required.",
    }),

  address: Joi.string().min(5).max(200).required().messages({
    "any.required": "Address is required.",
    "string.empty": "Address cannot be empty.",
    "string.min": "Address must be at least 5 characters.",
    "string.max": "Address cannot exceed 200 characters.",
  }),

  expiryDate: Joi.date()
    .greater("now")
    .max(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
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
});

export default foodDonationValidationSchema;
