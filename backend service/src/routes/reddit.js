// src/routes/reddit.js
// import express from 'express';
// import * as redditController from '../controllers/redditController.js';
// import authMiddleware from "../middlewares/authMiddleware.js";
// import * as redditAuthController from '../controllers/redditAuthController.js';

// const router = express.Router();

// router.get('/callback', redditAuthController.redditCallback);
// // Route to initiate Reddit OAuth
// router.get('/init', redditAuthController.connectReddit);
// router.get('/status', authMiddleware, redditAuthController.getUserStatus);
// router.post('/disconnect-reddit', authMiddleware, redditAuthController.disconnectReddit);

// // OAuth complete route
// router.post('/complete', authMiddleware, redditAuthController.completeRedditAuth);

// router.get('/search', authMiddleware, redditController.searchSubreddits);
// router.get('/posts/:subreddit/:sort', authMiddleware, redditController.getSubredditPosts);
// router.get('/history', authMiddleware, redditController.getUserSearchHistory);

// export default router;