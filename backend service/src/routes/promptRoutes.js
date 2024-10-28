import express from 'express';
import { createPrompt, deletePrompt, getUserPrompts, getPrompt, updatePrompt } from '../controllers/promptController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, createPrompt);
router.get('/:id',authMiddleware, getPrompt);
router.put('/:id', authMiddleware, updatePrompt);
router.delete('/:id', authMiddleware, deletePrompt);
router.get('/', authMiddleware, getUserPrompts);

export default router;