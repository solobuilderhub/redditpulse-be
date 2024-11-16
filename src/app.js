// src/app.js
import express from "express";
// import session from "express-session";
// import MongoStore from "connect-mongo"; // manages session storage in MongoDB
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import authRoutes from "./routes/auth.js";
import personaRoutes from "./routes/persona.js";
import client from 'prom-client';
import aiRoutes from "./routes/ai.js";
import stripeRoutes from "./routes/stripe.js";
import promptRoutes from "./routes/promptRoutes.js";
// import redditRoutes from "./routes/reddit.js";
import { handleStripeWebhook } from "./controllers/stripeController.js";
import cors from "cors";

dotenv.config();
connectDB();

const app = express();

// Trust proxy if behind a proxy (e.g., Heroku, Nginx)
app.set("trust proxy", 1);

// app.use(
//     cors({
//       origin: [process.env.FRONTEND_URL, process.env.BACKEND_URL],
//       credentials: true,
//     })
//   );

app.use(cors());
// For all other routes, use JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Prometheus metrics setup
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60] // buckets for response time from 0.1s to 60s
});


app.use((req, res, next) => {
  const end = httpRequestDurationSeconds.startTimer();
  res.on('finish', () => {
    console.log("req.originalUrl --> ", req.originalUrl);
    const labels = {
      route: req.originalUrl, // Use originalUrl to capture the full path
      code: res.statusCode,
      method: req.method
    };
    end(labels);
  });
  next();
});



app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);


// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});


app.use("/api/auth", authRoutes);
// app.use("/api/reddit", redditRoutes);
app.use("/api/personas", personaRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/prompt", promptRoutes);
app.use("/api", aiRoutes);

export default app;
