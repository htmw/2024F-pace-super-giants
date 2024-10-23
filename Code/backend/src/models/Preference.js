const mongoose = require("mongoose");

const preferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  dietaryRestrictions: [String],
  spicePreference: String,
  priceRange: String,
  favoriteCategories: [String],
  mealTiming: [String],
  allergies: [String],
  specialOccasions: Boolean,
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Preference", preferenceSchema);
