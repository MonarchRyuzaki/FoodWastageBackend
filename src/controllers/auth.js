import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { uploadToCloudinary } from "../config/cloudinary.js";
import EventHost from "../models/EventHost.js";
import Farmer from "../models/Farmer.js";
import NGO from "../models/NGO.js";
import User from "../models/User.js";
import { validateLogin, validateRegistration } from "../utils/validateAuth.js";
import {
  validateEventHost,
  validateFarmer,
  validateNGO,
} from "../utils/validateRolesRegistration.js";

const handleRegister = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    const validationResult = await validateRegistration(req, res);
    console.log(validationResult);
    if (validationResult.error) {
      return res.status(400).json({ error: validationResult.error });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
    });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const validationResult = await validateLogin(req, res);
    if (validationResult.error) {
      return res.status(400).json({ error: validationResult.error });
    }
    const user = await User.findOne({ email }).exec();

    const token = jwt.sign(
      { id: user._id, email: user.email, roles: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.status(201).json({
      token,
      message: "Login successful",
      user: {
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const handleApplyFarmer = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "ID Proof is required" });
    }
    const farmerData = {
      userId: req.user.id,
      farmName: req.body.farmName,
      farmAddress: req.body.farmAddress,
      farmSize: req.body.farmSize,
      farmType: req.body.farmType,
      cropsGrown: req.body.cropsGrown,
      yearsOfExperience: req.body.yearsOfExperience,
    };
    farmerData.idProof = await uploadToCloudinary(
      req.file.buffer,
      "farmer-id-proof"
    );

    const { error } = validateFarmer(farmerData);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const user = await User.findById(farmerData.userId).exec();
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role.includes("farmer"))
      return res.status(401).json({ message: "User is already a farmer" });

    // Farmer Verification Logic

    user.role.push("farmer");
    const farmer = new Farmer(farmerData);
    await user.save();
    await farmer.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, roles: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.status(201).json({ token, message: "Farmer role added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const handleApplyEventHost = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "ID Proof is required" });
    }
    const eventHostData = {
      userId: req.user.id,
      organization: req.body.organization,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
    };
    const user = await User.findById(eventHostData.userId).exec();
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.role.includes("event_host"))
      return res.status(401).json({ error: "User is already an event host" });

    eventHostData.idProof = await uploadToCloudinary(
      req.file.buffer,
      "event_host-id-proof"
    );

    const { error } = validateEventHost(eventHostData);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Event Host Verification Logic

    user.role.push("event_host");
    const eventHost = new EventHost(eventHostData);
    await user.save();
    await eventHost.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, roles: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.status(201).json({
      token,
      message: "Event Host role added successfully",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const handleApplyNGORole = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Registraion Proof is required" });
    }
    const ngoData = {
      userId: req.user.id,
      registrationNumber: req.body.registrationNumber,
      name: req.body.name,
      cause: req.body.cause,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      description: req.body.description,
    };
    const user = await User.findById(req.user.id).exec();
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.role.includes("ngo"))
      return res.status(401).json({ error: "User is already an NGO" });

    ngoData.registrationProof = await uploadToCloudinary(
      req.file.buffer,
      "ngo-registration-proof"
    );

    const { error } = validateNGO(ngoData);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // NGO Verification Logic

    user.role.push("ngo");
    const ngo = new NGO(ngoData);

    const token = jwt.sign(
      { id: user._id, email: user.email, roles: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    await user.save();
    await ngo.save();
    res.status(201).json({ token, message: "NGO role added successfully" });
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
  handleApplyEventHost,
  handleApplyFarmer,
  handleApplyNGORole,
  handleLogin,
  handleRegister,
};
