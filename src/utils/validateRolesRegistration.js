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
      .pattern(new RegExp(/^https?:\/\/.*\.(jpg|jpeg|png|pdf)$/))
      .message("idProof must be a valid URL pointing to a valid image or PDF."),
    cropsGrown: Joi.array().items(Joi.string().max(50)).optional(),
    yearsOfExperience: Joi.number().min(0).max(100).optional(),
    verified: Joi.boolean().optional(),
  });

  return schema.validate(data);
};


