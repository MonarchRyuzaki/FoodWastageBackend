import bcrypt from "bcryptjs";
import User from "../models/User.js";

const handleRegister = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    const existingUser = await User.findOne({ email }).exec();
    if (existingUser) {
      return res.status(400).json({ error: "User already exists." });
    }
    if (password.length < 8) {
      return res
        .status(401)
        .json({ error: "Password should be at least 8 characters long." });
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
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ error: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Invalid email or password" });

    const token = jwt.sign(
      { id: user._id, roles: user.roles },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.json({
      token,
      user: { id: user._id, name: user.name, roles: user.roles },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const handleApplyFarmer = async (req, res) => {
  try {
    const { farmDetails } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.roles.push("farmer");
    user.farmDetails = farmDetails;
    await user.save();

    res.json({ message: "Farmer role added successfully", roles: user.roles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const handleApplyEventHost = async (req, res) => {
  try {
    const { organization, eventType, location } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.roles.push("event_host");
    user.eventHostDetails = { organization, eventType, location };
    await user.save();

    res.json({
      message: "Event Host role added successfully",
      roles: user.roles,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const handleApplyNGORole = async (req, res) => {
  try {
    const { ngoName, registrationNumber, cause, headquarters } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.roles.push("ngo");
    user.ngoDetails = { ngoName, registrationNumber, cause, headquarters };
    await user.save();

    res.json({ message: "NGO role added successfully", roles: user.roles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getRoles = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ userId: user._id, roles: user.roles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export { handleApplyFarmer, handleLogin, handleRegister, handleApplyEventHost, handleApplyNGORole, getRoles };
