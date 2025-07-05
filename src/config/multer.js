import multer from "multer";

const storage = multer.memoryStorage();

export const idProofUpload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).single("idProof");

export const foodImagesUpload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).single("foodImage");
