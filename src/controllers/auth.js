import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { uploadToCloudinary } from "../config/cloudinary.js";
import EventHost from "../models/EventHost.js";
import Farmer from "../models/Farmer.js";
import NGO from "../models/NGO.js";
import User from "../models/User.js";
import { validateLogin, validateRegistration } from "../utils/validateAuth.js";
import { validateFarmer } from "../utils/validateRolesRegistration.js";

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
    const {
      farmName,
      farmAddress,
      farmSize,
      farmType,
      cropsGrown,
      yearsOfExperience,
    } = req.body;

    req.body.idProof = await uploadToCloudinary(
      req.file.buffer,
      "farmer-id-proof"
    );

    const { error } = validateFarmer(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const user = await User.findById(req.user.id).exec();
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role.includes("farmer"))
      return res.status(401).json({ message: "User is already a farmer" });

    // Farmer Verification Logic

    const farmDetails = {
      farmName,
      farmAddress,
      farmSize,
      farmType,
      idProof: req.body.idProof,
      cropsGrown,
      yearsOfExperience,
    };
    user.role.push("farmer");
    const farmer = new Farmer({ ...farmDetails, userId: user._id });
    await user.save();
    await farmer.save();

    res.status(201).json({ message: "Farmer role added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const handleApplyEventHost = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "ID Proof is required" });
    }
    const {
      organization,
      phone,
      email,
      address,
      city,
      state,
      zip,
      country,
      about,
      website,
      facebook,
      instagram,
      twitter,
    } = req.body;
    const user = await User.findById(req.user.id).exec();
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.role.includes("event_host"))
      return res.status(401).json({ error: "User is already an event host" });

    req.body.idProof = await uploadToCloudinary(
      req.file.buffer,
      "event_host-id-proof"
    );

    const { error } = validateEventHost(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }


    // Event Host Verification Logic

    user.role.push("event_host");
    const eventHost = new EventHost({
      organization,
      phone,
      email,
      address,
      city,
      state,
      zip,
      country,
      about,
      website,
      facebook,
      instagram,
      twitter,
      idProof : req.body.idProof,
      userId: user._id,
    });
    await user.save();
    await eventHost.save();

    res.status(201).json({
      message: "Event Host role added successfully",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const handleApplyNGORole = async (req, res) => {
  try {
    const {
      registrationNumber,
      registrationProof,
      name,
      cause,
      email,
      phone,
      address,
      description,
      website,
      logo,
      cover,
      status,
    } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.role.includes("ngo"))
      return res.status(401).json({ error: "User is already an NGO" });

    // NGO Verification Logic

    user.role.push("ngo");
    const ngo = new NGO({
      registrationNumber,
      registrationProof,
      name,
      cause,
      email,
      phone,
      address,
      description,
      website,
      logo,
      cover,
      status,
      userId: user._id,
    });

    await user.save();
    await ngo.save();
    res.status(201).json({ message: "NGO role added successfully" });
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
