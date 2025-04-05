import mongoose from "mongoose";
import app from "./app.js";
import { startBackgroundJobs } from "./cronJobs/index.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  async function connectToDatabase() {
    try {
      await mongoose.connect(process.env.MONGODB_URL);
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("Error connecting to MongoDB:", error.message);
    }
  }

  // Call the function to connect
  connectToDatabase();
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  startBackgroundJobs(); // 🎶 Let the watchers awaken
});
