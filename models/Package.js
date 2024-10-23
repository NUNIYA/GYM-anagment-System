const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, // in months
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    studentDiscount: {
      type: Number,
      default: 50, // percentage
    },
    features: [
      {
        type: String,
      },
    ],
    sessions: [
      {
        day: String,
        startTime: String,
        endTime: String,
      },
    ],
    campus: {
      type: String,
      enum: ["4kilo", "6kilo", "both"],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Package = mongoose.model("Package", packageSchema);

module.exports = Package;
