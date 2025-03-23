import validator from "validator";
import User from "../models/User.js";

export const validateRegistration = async (req, res) => {
  let { name, email, password, phone, address } = req.body;

  // Trim whitespace
  name = name?.trim();
  email = email?.trim();
  phone = phone?.trim();
  address = address?.trim();
  console.log(name, email, phone, address);

  // Validate Name (Should not be empty and min 3 characters)
  if (!name || name.length < 3) {
    return { error: "Name must be at least 3 characters long." };
  }

  // Validate Email Format
  if (!validator.isEmail(email)) {
    return { error: "Invalid email format." };
  }

  // Check if Email Already Exists
  const existingUser = await User.findOne({ email }).exec();
  if (existingUser) {
    return { error: "User already exists." };
  }

  // Validate Phone Number (10-digit Indian format)
  if (!/^[6-9]\d{9}$/.test(phone)) {
    return {
      error: "Invalid phone number. Must be 10 digits and start with 6-9.",
    };
  }

  // Validate Address (Ensure it's not empty and min 5 characters)
  if (!address || address.length < 5) {
    return { error: "Address must be at least 5 characters long." };
  }

  // Validate Password Strength
  if (
    !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
      password
    )
  ) {
    return {
      error:
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
    };
  }

  // If all validations pass
  return { success: true };
};
