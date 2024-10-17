// src/routes/protected.js
import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getLinkedInComment } from "../controllers/aiController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/ai", (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

router.post("/ai/comment", getLinkedInComment);


export default router;
