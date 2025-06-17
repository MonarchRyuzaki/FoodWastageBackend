/*
  Script to seed FoodDonation entries by reading seedData.json
  and POSTing to the create endpoint with a Bearer token.
  Adjust BASE_URL and CREATE_PATH as needed.
*/
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BASE_URL = "http://localhost:5000";
const CREATE_PATH = "/api/food-donations";
const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MzJjOWQxNjVkMmVjNDc1NmNhYjJlZCIsIm5hbWUiOiJTaGl2YW0gR2FuZ3VseSIsImVtYWlsIjoidGVzdEBnbWFpbC5jb20iLCJyb2xlIjoiRG9ub3IiLCJpYXQiOjE3NTAxNDYwNTEsImV4cCI6MTc1MDIzMjQ1MX0.ENuEhfH-bKW7i7fmw-cv6jXAWsq7iupJJRilM67ZiHg"; // set in .env: BEARER_TOKEN=your_token_here

if (!TOKEN) {
  console.error("Error: BEARER_TOKEN not set in environment");
  process.exit(1);
}

// Load seed data
const dataPath = path.join(__dirname, "seedData.json");
let seedData;
try {
  seedData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
} catch (err) {
  console.error("Failed to read seedData.json:", err);
  process.exit(1);
}

async function insertEntry(entry) {
  try {
    // Prepare payload matching your create endpoint expectations
    const payload = {
      title: entry.title,
      description: entry.description,
      type: entry.type,
      quantity: entry.quantity,
      address: entry.address,
      city: entry.city,
      state: entry.state,
      latitude: entry.latitude,
      longitude: entry.longitude,
      expiryDate: entry.expiryDate,
    };

    const response = await axios.post(`${BASE_URL}${CREATE_PATH}`, payload, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });

    console.log(`Inserted ${entry.title}:`, response.data);
  } catch (error) {
    console.error(
      `Error inserting ${entry.title}:`,
      error.response ? error.response.data : error.message
    );
  }
}

async function run() {
  console.log(
    `Seeding ${seedData.length} entries to ${BASE_URL}${CREATE_PATH}`
  );
  for (const entry of seedData) {
    await insertEntry(entry);
    // Optional: Add a delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 2000)); // 1 second
  }
  console.log("Seeding complete.");
}

run();
