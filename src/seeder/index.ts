import mongoose from "mongoose";
import dotenv from "dotenv";
import { generateData } from "../services/seeder.service";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/eventnetwork";

const dropAndSeed = async () => {
  try {
    await mongoose.connect(MONGODB_URI, { autoIndex: true });

    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.drop();
    }
    console.log("All collections dropped");

    await generateData();
    console.log("All data generated");

    mongoose.connection.close();
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
};

dropAndSeed();
