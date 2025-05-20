import User from "../models/User.js";
import bcrypt from "bcryptjs";
import NGO from "../models/NGO.js";

export const checkAlreadyRegistered = async (email, Model) => {
  const existingUser = await Model.findOne({ email }).exec();
  if (existingUser) {
    if (Model === User) {
      return { error: "User already exists." };
    }
    if (Model === NGO) {
      return { error: "NGO already exists." };
    }
  }
  return { success: true };
}

export const validateLogin = async (req, res, Model) => {
  const { email, password } = req.body;
  const user = await Model.findOne({ email }).exec();
  if (!user)
    return { error: "Invalid email or password" };

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return { error: "Invalid email or password" };

  return { success: true, user };
};
