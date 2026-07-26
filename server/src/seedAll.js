require("dotenv").config();

const mongoose = require("mongoose");

const Topic = require("./models/Topic");
const Company = require("./models/Company");
const Sheet = require("./models/Sheet");

const topics = require("./data/topics");
const companies = require("./data/companies");
const sheets = require("./data/sheets");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected");

    await Topic.deleteMany();
    await Company.deleteMany();
    await Sheet.deleteMany();

    await Topic.insertMany(topics);
    await Company.insertMany(companies);
    await Sheet.insertMany(sheets);

    console.log("🎉 Database Seeded Successfully");

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();