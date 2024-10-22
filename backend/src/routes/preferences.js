const express = require("express");
const router = express.Router();
const Preference = require("../models/Preference");
const auth = require("../middleware/auth");

router.post("/", auth, async (req, res) => {
  try {
    const preference = new Preference({
      userId: req.user.userId,
      ...req.body,
    });
    await preference.save();
    res.status(201).json(preference);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const preference = await Preference.findOne({ userId: req.user.userId });
    if (!preference) {
      return res.status(404).json({ error: "Preferences not found" });
    }
    res.json(preference);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/", auth, async (req, res) => {
  try {
    const preference = await Preference.findOneAndUpdate(
      { userId: req.user.userId },
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true },
    );
    if (!preference) {
      return res.status(404).json({ error: "Preferences not found" });
    }
    res.json(preference);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
