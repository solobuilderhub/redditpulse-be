// src/controllers/stripeController.js
import Stripe from "stripe";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const createCheckoutSession = async (req, res) => {
  const { priceId } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const session = await stripe.checkout.sessions.create({
      customer: user.stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/dashboard`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard/subscription`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Error creating checkout session' });
  }
};

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error) {
    console.error(`Error processing event ${event.type}:`, error);
    return res.status(500).send(`Error processing event: ${error.message}`);
  }

  res.json({ received: true });
};

async function handleSubscriptionDeleted(subscription) {
  const user = await User.findOne({ stripeCustomerId: subscription.customer });
  if (!user) {
    console.error('User not found for customer:', subscription.customer);
    return;
  }

  user.subscriptionStatus = 'canceled';
  user.subscriptionPlan = 'free';
  user.linkedinApiCalls = 12;
  user.availableRequest = 7;
  user.subscriptionEndDate = new Date();

  await user.save();
}

export const cancelSubscription = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user || !user.subscriptionId) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    const canceledSubscription = await stripe.subscriptions.del(user.subscriptionId);

    user.subscriptionStatus = 'canceled';
    user.subscriptionPlan = 'free';
    await user.save();

    res.json({ message: 'Subscription canceled successfully' });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: 'Error canceling subscription' });
  }
};

export const reactivateSubscription = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user || !user.subscriptionId) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    const reactivatedSubscription = await stripe.subscriptions.update(user.subscriptionId, {
      cancel_at_period_end: false,
    });

    user.subscriptionStatus = 'active';
    await user.save();

    res.json({ message: 'Subscription reactivated successfully' });
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    res.status(500).json({ error: 'Error reactivating subscription' });
  }
};

async function handleCheckoutSessionCompleted(session) {
  const user = await User.findOne({ email: session.customer_email });
  if (!user) {
    console.error("User not found for email:", session.customer_email);
    return;
  }

  user.stripeCustomerId = session.customer;
  user.subscriptionId = session.subscription;
  user.subscriptionStatus = "active";

  await updateUserSubscription(user, session.subscription);
}

async function handleInvoicePaymentSucceeded(invoice) {
  const user = await User.findOne({ stripeCustomerId: invoice.customer });
  if (!user) {
    console.error("User not found for customer:", invoice.customer);
    return;
  }

  await updateUserSubscription(user, invoice.subscription);
}

async function handleSubscriptionUpdated(subscription) {
  const user = await User.findOne({ stripeCustomerId: subscription.customer });
  if (!user) {
    console.error("User not found for customer:", subscription.customer);
    return;
  }

  user.subscriptionStatus = subscription.status;
  user.subscriptionEndDate = new Date(subscription.current_period_end * 1000);

  if (subscription.status === "active") {
    await updateUserSubscription(user, subscription.id);
  } else if (subscription.status === "canceled") {
    user.subscriptionPlan = "free";
    user.linkedinApiCalls = 12;
    user.availableRequest = 7;
  }

  await user.save();
}

async function updateUserSubscription(user, subscriptionId) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const plan = subscription.items.data[0].plan;

  if (plan.interval === "month") {
    user.subscriptionPlan = "monthly";
    user.linkedinApiCalls = 90;
    user.availableRequest = 200;
  } else if (plan.interval === "year") {
    user.subscriptionPlan = "yearly";
    user.linkedinApiCalls = 90 * 12;
    user.availableRequest = 200 * 12;
  }

  user.subscriptionEndDate = new Date(subscription.current_period_end * 1000);
  await user.save();
}