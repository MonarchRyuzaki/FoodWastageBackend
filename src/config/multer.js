import multer from "multer";

const storage = multer.memoryStorage();

const idProofUpload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).single("idProof");

export default idProofUpload;
