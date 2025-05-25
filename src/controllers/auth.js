import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { uploadToCloudinary } from "../config/cloudinary.js";
import NGO from "../models/NGO.js";
import User from "../models/User.js";
import { insertNewDonor } from "../sparql/creatingNewDonor.js";
import { insertNewNGO } from "../sparql/creatingNewNGO.js";
import {
  checkAlreadyRegistered,
  validateLogin,
} from "../utils/validateAuth.js";
import {
  validateDonor,
  validateNGO,
} from "../utils/validateRolesRegistration.js";

const Models = [User, NGO];

const handleRegister = async (req, res) => {
  try {
    const donorData = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      phone: req.body.phone,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
    };
    console.log(donorData);
    const { error } = validateDonor(donorData);
    console.log(error);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    console.log(donorData);
    for (const Model of Models) {
      const { error } = await checkAlreadyRegistered(donorData.email, Model);
      if (error) {
        return res.status(400).json({ error });
      }
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(donorData.password, salt);
    donorData.password = hashedPassword;
    const newUser = new User(donorData);
    await newUser.save();
    await insertNewDonor({
      mongoID: newUser._id,
    });

    res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const handleLogin = async (req, res) => {
  try {
    const validationResult = await validateLogin(req, res, User);
    if (validationResult.error) {
      return res.status(400).json({ error: validationResult.error });
    }
    const user = validationResult.user;
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: "Donor" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.status(201).json({
      token,
      message: "Login successful",
      user: {
        email: user.email,
        role: "Donor",
        name: user.name,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const handleNGORegister = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Registration Proof is required" });
    }
    const ngoData = {
      registrationNumber: req.body.registrationNumber,
      password: req.body.password,
      name: req.body.name,
      cause: req.body.cause,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      description: req.body.description,
      city: req.body.city,
      state: req.body.state,
      prefersFoodType: req.body.prefersFoodType
        .split(",")
        .map((type) => type.trim()),
      rejectsFoodType: req.body.rejectsFoodType
        .split(",")
        .map((type) => type.trim()),
      avoidsAllergen: req.body.avoidsAllergen
        .split(",")
        .map((allergen) => allergen.trim()),
    };
    console.log(ngoData);
    for (const Model of Models) {
      const { error } = await checkAlreadyRegistered(ngoData.email, Model);
      if (error) {
        return res.status(400).json({ error });
      }
    }
    const { error } = validateNGO(ngoData);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    ngoData.registrationProof = await uploadToCloudinary(
      req.file.buffer,
      "ngo-registration-proof"
    );


    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ngoData.password, salt);
    ngoData.password = hashedPassword;
    // NGO Verification Logic

    // TODO: Set status as "pending" instead of auto-approving.
    // This will need frontend update — currently skipping admin approval for flow continuity.
    // Reminder added to todo.txt
    // TODO: Once status flow is fixed to "pending", send waiting email here.
    // Use mailer.sendPendingRoleEmail(user.email, user.name);

    const ngo = new NGO(ngoData);
    ngo.status = "approved"; // Set status to approved for now
    await ngo.save();
    await insertNewNGO({
      mongoID: ngo._id,
      prefersFoodType: ngoData.prefersFoodType,
      rejectsFoodType: ngoData.rejectsFoodType,
      avoidsAllergen: ngoData.avoidsAllergen,
    });
    res.status(201).json({ message: "NGO role added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const handleNGOLogin = async (req, res) => {
  try {
    const validationResult = await validateLogin(req, res, NGO);
    if (validationResult.error) {
      return res.status(400).json({ error: validationResult.error });
    }
    const ngo = validationResult.user;

    const token = jwt.sign(
      { id: ngo._id, name: ngo.name, email: ngo.email, role: "NGO" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.status(201).json({
      token,
      message: "Login successful",
      user: {
        email: ngo.email,
        role: ngo.role,
        name: ngo.name,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getRoles = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).exec();
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ userId: user._id, roles: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export {
  getRoles,
  handleLogin,
  handleNGOLogin,
  handleNGORegister,
  handleRegister,
};
