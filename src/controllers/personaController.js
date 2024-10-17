// src/controllers/personaController.js
import Persona from "../models/Persona.js";
import User from "../models/User.js";

export const getPersonas = async (req, res) => {
  try {
    const userId = req.user.id;
    const personas = await Persona.find({ userId }).exec();

    if (!personas) {
      return res
        .status(404)
        .json({ message: "No personas found for this user" });
    }

    res.json(personas);
  } catch (error) {
    console.error("Error fetching personas:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPersonaById = async (req, res) => {
  const { id } = req.params;
  try {
    const persona = await Persona.findById(id).exec();

    if (!persona) {
      return res.status(404).json({ message: "Persona not found" });
    }

    res.json(persona);
  } catch (error) {
    console.error("Error fetching persona:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createPersona = async (req, res) => {
  const { job, industry, niche, experience, expertise } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newPersona = new Persona({
      userId,
      job,
      industry,
      niche,
      experience,
      expertise,
    });

    await newPersona.save();

    // Increment the personaCount
    await User.findByIdAndUpdate(userId, { $inc: { personaCount: 1 } });

    res.status(201).json(newPersona);
  } catch (error) {
    console.error("Error creating persona:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updatePersona = async (req, res) => {
  const { id } = req.params;
  const { job, industry, niche, experience, expertise } = req.body;

  try {
    const updatedPersona = await Persona.findByIdAndUpdate(
      id,
      { job, industry, niche, experience, expertise },
      { new: true }
    ).exec();

    if (!updatedPersona) {
      return res.status(404).json({ message: "Persona not found" });
    }

    res.json(updatedPersona);
  } catch (error) {
    console.error("Error updating persona:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deletePersona = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedPersona = await Persona.findByIdAndDelete(id).exec();

    if (!deletedPersona) {
      return res.status(404).json({ message: "Persona not found" });
    }

    // Decrement the personaCount
    await User.findByIdAndUpdate(deletedPersona.userId, { $inc: { personaCount: -1 } });

    res.json({ message: "Persona deleted" });
  } catch (error) {
    console.error("Error deleting persona:", error);
    res.status(500).json({ message: "Server error" });
  }
};