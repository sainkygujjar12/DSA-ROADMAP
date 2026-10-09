require("dotenv").config();

const mongoose = require("mongoose");
const User = require("./models/User");
const { OWNER_EMAIL, isOwnerEmail } = require("./config/admin");
const connectDB = require("./config/db");

const email = String(process.argv[2] || OWNER_EMAIL).trim().toLowerCase();

if (!isOwnerEmail(email)) {
  console.error("Only the configured owner account can be promoted.");
  process.exit(1);
}

async function promote() {
  try {
    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error(`No user found for ${email}. Register and verify the account first.`);
    }

    if (!user.isVerified) throw new Error("Verify your email through the app before enabling admin access.");
    user.role = "admin";
    await user.save();
    console.log(`${user.email} is now an admin.`);
  } finally {
    await mongoose.disconnect();
  }
}

promote().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
