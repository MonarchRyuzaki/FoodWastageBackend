import mongoose from "mongoose";

const farmerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    farmName: { type: String, required: true },
    farmAddress: { type: String, required: true },
    farmSize: { type: Number, required: true }, // Keeping it Number for consistency
    farmType: [{
      type: String,
      required: true,
      enum: ["Organic", "Dairy", "Aquaculture", "Poultry", "Horticulture"],
    }], // E.g., Organic, Dairy, etc.
    idProof: { type: String, required: true }, // URL for file upload
    verified: { type: Boolean, default: false }, // For verification status
    cropsGrown: [{ type: String }], // Optional, for future scalability
    yearsOfExperience: { type: Number, default: 0 }, // Optional
  },
  { timestamps: true }
);

const Farmer = mongoose.model("Farmer", farmerSchema);
export default Farmer;
