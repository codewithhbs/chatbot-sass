const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String, 
  picture: String,
  authType: { type: String, enum: ["google", "custom"], default: "custom" }
});

module.exports = mongoose.model("User", userSchema);
