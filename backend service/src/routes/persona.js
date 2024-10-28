// src/routes/persona.js
import express from "express";
import {
  getPersonas,
  getPersonaById,
  createPersona,
  updatePersona,
  deletePersona,
} from "../controllers/personaController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getPersonas);
router.get("/:id", getPersonaById);
router.post("/", createPersona);
router.put("/:id", updatePersona);
router.delete("/:id", deletePersona);

export default router;
