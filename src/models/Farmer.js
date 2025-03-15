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
    farmSize: { type: Number, required: true },
    farmType: { type: String, required: true },
    farmProduce: { type: String, required: true },
    farmProduceQuantity: { type: Number, required: true },
    farmProducePrice: { type: Number, required: true },
    farmProduceImage: { type: String, required: true },
    farmProduceDescription: { type: String, required: true },
    farmProduceAvailability: { type: Boolean, required: true },
    farmProduceDelivery: { type: Boolean, required: true },
    farmProduceDeliveryFee: { type: Number, required: true },
    farmProduceDeliveryTime: { type: String, required: true },
    farmProducePaymentMethod: { type: String, required: true },
    farmProducePaymentDetails: { type: String, required: true },
    farmProducePaymentProof: { type: String, required: true },
    idProof: { type: String, required: true },
  },
  { timestamps: true }
);

const Farmer = mongoose.model("Farmer", farmerSchema);
export default Farmer;
