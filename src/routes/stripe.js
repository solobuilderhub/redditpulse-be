// src/routes/stripe.js
import express from 'express';
import { createCheckoutSession, cancelSubscription, reactivateSubscription } from '../controllers/stripeController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/create-checkout-session', authMiddleware, createCheckoutSession);
router.post('/cancel-subscription', authMiddleware, cancelSubscription);
router.post('/reactivate-subscription', authMiddleware, reactivateSubscription);

export default router;