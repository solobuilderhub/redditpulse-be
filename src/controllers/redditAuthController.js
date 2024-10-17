// import querystring from "querystring";
// import axios from "axios";
// import User from "../models/User.js";
// import { decryptTokens, encryptTokens } from "../utils/encryption.js";

// const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID;
// const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
// const REDDIT_REDIRECT_URI = process.env.REDDIT_REDIRECT_URI; // e.g., https://yourdomain.com/api/auth/reddit/callback
// const REDDIT_USER_AGENT = process.env.REDDIT_USER_AGENT;
// const FRONTEND_URL = process.env.FRONTEND_URL;

// export const getUserStatus = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const user = await User.findById(userId).select("redditAccessToken");
//     const isRedditConnected = Boolean(user && user.redditAccessToken);
//     res.json({ isRedditConnected });
//   } catch (error) {
//     console.error("Error fetching user status:", error);
//     res.status(500).json({ message: "Error fetching user status" });
//   }
// };

// export const disconnectReddit = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Remove Reddit tokens
//     user.redditAccessToken = undefined;
//     user.redditRefreshToken = undefined;
//     user.redditTokenExpiry = undefined;
//     await user.save();

//     res.json({ message: "Successfully disconnected Reddit account." });
//   } catch (error) {
//     console.error("Error disconnecting Reddit:", error);
//     res.status(500).json({ message: "Failed to disconnect Reddit account." });
//   }
// };

// // Helper function to generate a random string for state parameter
// const generateRandomString = (length) => {
//   let text = "";
//   const possible =
//     "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//   for (let i = 0; i < length; i++) {
//     text += possible.charAt(Math.floor(Math.random() * possible.length));
//   }
//   return text;
// };

// // Initiate Reddit OAuth flow
// export const connectReddit = (req, res) => {
//     const state = generateRandomString(16);
    
//     // Store the state in the session
//     req.session.redditOAuthState = state;
//     console.log("Stored state in session:", req.session.redditOAuthState); // Should log the same state

//     const scope = "identity read";
//     const authUrl = `https://www.reddit.com/api/v1/authorize?${querystring.stringify({
//       client_id: REDDIT_CLIENT_ID,
//       response_type: "code",
//       state: state,
//       redirect_uri: REDDIT_REDIRECT_URI,
//       duration: "permanent",
//       scope: scope,
//     })}`;
  
//     res.redirect(authUrl);
//   };
// // Handle Reddit OAuth callback
// export const redditCallback = async (req, res) => {
//     const { code, state, error, error_description } = req.query;
  
//     // console.log("Received Reddit callback with query:", req.query);
//     // console.log("Stored state in session:", req.session.redditOAuthState);
  
//     if (error) {
//     //   console.error(`Reddit OAuth Error: ${error} - ${error_description}`);
//       return res.redirect(`${process.env.FRONTEND_URL}/dashboard/reddit/callback?reddit=error`);
//     }
  
//     // Validate state parameter
//     if (state !== req.session.redditOAuthState) {
//     //   console.error("Invalid state parameter");
//       return res.status(400).json({ message: "Invalid state parameter" });
//     }
  
//     try {
//     //   console.log("Exchanging code for tokens...");
  
//       const tokenResponse = await axios.post(
//         "https://www.reddit.com/api/v1/access_token",
//         querystring.stringify({
//           grant_type: "authorization_code",
//           code: code,
//           redirect_uri: process.env.REDDIT_REDIRECT_URI,
//         }),
//         {
//           auth: {
//             username: process.env.REDDIT_CLIENT_ID,
//             password: process.env.REDDIT_CLIENT_SECRET,
//           },
//           headers: {
//             "Content-Type": "application/x-www-form-urlencoded",
//             "User-Agent": process.env.REDDIT_USER_AGENT,
//           },
//           timeout: 30000, // 10 seconds timeout
//         }
//       );
  
//     //   console.log("Token response received:", tokenResponse.data);
  
//       const { access_token, refresh_token, expires_in } = tokenResponse.data;
  
//       // Encrypt the token data
//       const encryptedData = encryptTokens({
//         access_token,
//         refresh_token,
//         expires_in,
//       });
  
//     //   console.log("Encrypted data:", encryptedData);
  
//       // Redirect with encrypted data
//       res.redirect(
//         `${process.env.FRONTEND_URL}/dashboard/reddit/callback?data=${encodeURIComponent(encryptedData)}`
//       );
//     } catch (error) {
//       console.error("Error exchanging code for tokens:");
  
//     //   if (error.response) {
//     //     // The request was made and the server responded with a status code outside 2xx
//     //     console.error("Response data:", error.response.data);
//     //     console.error("Response status:", error.response.status);
//     //     console.error("Response headers:", error.response.headers);
//     //   } else if (error.request) {
//     //     // The request was made but no response was received
//     //     console.error("No response received:", error.request);
//     //   } else {
//     //     // Something happened in setting up the request
//     //     console.error("Error message:", error.message);
//     //   }
  
//     //   console.error("Config:", error.config);
  
//       res.redirect(`${process.env.FRONTEND_URL}/dashboard/reddit/callback?reddit=error`);
//     }
//   };

// export const completeRedditAuth = async (req, res) => {
//   try {
//     const { encryptedData } = req.body;
//     const { access_token, refresh_token, expires_in } =
//       decryptTokens(encryptedData);

//     const userId = req.user.id;
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     user.redditAccessToken = access_token;
//     user.redditRefreshToken = refresh_token;
//     user.redditTokenExpiry = new Date(Date.now() + expires_in * 1000);
//     await user.save();

//     res.json({ message: "Reddit account connected successfully" });
//   } catch (error) {
//     // console.error("Error completing Reddit authentication:", error);
//     res
//       .status(500)
//       .json({ message: "Failed to complete Reddit authentication" });
//   }
// };
