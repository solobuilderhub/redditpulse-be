import Persona from "../models/Persona.js";

export const getPersonaDetails = async (personaId) => {
  try {
    const persona = await Persona.findById(personaId).populate("userId");
    if (!persona) {
      throw new Error("Persona not found");
    }
    return persona;
  } catch (error) {
    throw new Error(error.message);
  }
};
