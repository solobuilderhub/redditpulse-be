// src/models/Persona.js
import mongoose from "mongoose";

const PersonaSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    job: String,
    industry: String,
    niche: String,
    experience: String,
    expertise: String,
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

const Persona = mongoose.model("Persona", PersonaSchema);

export default Persona;
