import EventHost from "../models/EventHost.js";
import Farmer from "../models/Farmer.js";
import NGO from "../models/NGO.js";

const roleModelMap = {
  farmer: Farmer,
  ngo: NGO,
  event_host: EventHost,
};

// Utility to get the model based on role
const getModelByRole = (role) => {
  return roleModelMap[role] || null;
};

// List applications based on role and optional status
export const getApplications = async (req, res) => {
  try {
    const { role, status } = req.query;

    if (!role || !roleModelMap[role]) {
      return res.status(400).json({ error: "Invalid or missing role." });
    }

    const Model = getModelByRole(role);
    const query = status ? { status } : {};

    const applications = await Model.find(query);
    res.json({ data: applications });
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Get application details by ID and role
export const getApplicationDetails = async (req, res) => {
  try {
    const { role, id } = req.params;

    if (!role || !roleModelMap[role]) {
      return res.status(400).json({ error: "Invalid or missing role." });
    }

    const Model = getModelByRole(role);
    const application = await Model.findById(id);

    if (!application) {
      return res.status(404).json({ error: "Application not found." });
    }

    res.json({ data: application });
  } catch (error) {
    console.error("Error fetching application details:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Approve or reject application
export const updateApplicationStatus = async (req, res) => {
  try {
    const { role, id } = req.params;
    const { status } = req.body;

    if (!role || !roleModelMap[role]) {
      return res.status(400).json({ error: "Invalid or missing role." });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status." });
    }

    const Model = getModelByRole(role);
    const application = await Model.findById(id);

    if (!application) {
      return res.status(404).json({ error: "Application not found." });
    }

    if (status === "approved") {
      const {subject, text, html} = approvalEmailTemplate(application.name, role);
      sendEmail({
        to: application.email,
        subject,
        text,
        html,
      });
    }

    if (status === "rejected") {
      const {subject, text, html} = rejectionEmailTemplate(application.name, role);
      sendEmail({
        to: application.email,
        subject,
        text,
        html,
      });
    }

    application.status = status;
    await application.save();

    res.json({ message: `Application ${status} successfully.` });
  } catch (error) {
    console.error("Error updating application status:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
