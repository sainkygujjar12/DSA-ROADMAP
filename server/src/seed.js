require("dotenv").config();

const mongoose = require("mongoose");

const Topic = require("./models/Topic");
const topics = require("./data/topics");

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected");

    await Topic.deleteMany();

    console.log("🗑️ Old Topics Removed");

    await Topic.insertMany(topics);

    console.log("🎉 Topics Seeded Successfully");

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seedDatabase();