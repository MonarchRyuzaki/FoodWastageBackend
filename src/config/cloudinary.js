import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  secure: true,
});
export const uploadToCloudinary = async (fileBuffer, folderName) => {
  try {
    // Convert buffer to base64
    const fileBase64 = fileBuffer.toString("base64");
    const dataUri = `data:image/jpeg;base64,${fileBase64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: folderName,
      resource_type: "image",
    });

    // Return Cloudinary response
    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error("Failed to upload image");
  }
};
export default cloudinary;
