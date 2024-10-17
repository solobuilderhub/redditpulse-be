// src/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    personaCount: {
      type: Number,
      default: 0,
    },
    availableRequest: {
      type: Number,
      default: 7,
    },
    stripeCustomerId: {
      type: String,
    },
    subscriptionId: {
      type: String,
    },
    subscriptionStatus: {
      type: String,
      enum: ["active", "canceled", "past_due", "trialing"],
      default: "trialing",
    },
    subscriptionPlan: {
      type: String,
      enum: ["monthly", "yearly", "free"],
      default: "free",
    },
    subscriptionEndDate: {
      type: Date,
    },
    num_reddit_req: {
      type: Number,
      default: 10, // Set a default value
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    // **Reddit OAuth**
    // redditAccessToken: String,
    // redditRefreshToken: String,
    // redditTokenExpiry: Date,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
