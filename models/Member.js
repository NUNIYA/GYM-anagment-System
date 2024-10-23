const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    selectedPackage: {
      type: String,
      required: true,
    },
    isStudent: {
      type: Boolean,
      default: false,
    },
    studentIdPhoto: {
      type: String,
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    paymentScreenshot: {
      type: String,
      required: true,
    },
    membershipStatus: {
      type: String,
      enum: ["active", "cancelled", "expired"],
      default: "active",
    },
    membershipStartDate: {
      type: Date,
      default: Date.now,
    },
    membershipEndDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Member = mongoose.model("Member", memberSchema);

module.exports = Member;
