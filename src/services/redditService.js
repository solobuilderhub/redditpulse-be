// import querystring from "querystring";
// import axios from "axios";
// import axiosRetry from "axios-retry";
// import RedditSearch from "../models/RedditSearch.js";
// import User from "../models/User.js";
// import Bottleneck from "bottleneck";

// const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID;
// const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
// const REDDIT_USER_AGENT = process.env.REDDIT_USER_AGENT;

// // Initialize Bottleneck for rate limiting
// const limiter = new Bottleneck({
//   reservoir: 60, // Number of requests
//   reservoirRefreshAmount: 60,
//   reservoirRefreshInterval: 60 * 1000, // Refresh every minute
//   maxConcurrent: 5, // Maximum concurrent requests
//   minTime: 200, // Minimum time between requests
// });

// // Helper function to refresh tokens
// const refreshRedditToken = async (user) => {
//   try {
//     const tokenResponse = await axios.post(
//       "https://www.reddit.com/api/v1/access_token",
//       querystring.stringify({
//         grant_type: "refresh_token",
//         refresh_token: user.redditRefreshToken,
//       }),
//       {
//         auth: {
//           username: REDDIT_CLIENT_ID,
//           password: REDDIT_CLIENT_SECRET,
//         },
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//           "User-Agent": REDDIT_USER_AGENT,
//         },
//         timeout: 60000, // 60 seconds
//       }
//     );

//     const { access_token, expires_in } = tokenResponse.data;
//     user.redditAccessToken = access_token;
//     user.redditTokenExpiry = new Date(Date.now() + expires_in * 1000);
//     await user.save();
//     console.log("Reddit token refreshed successfully");
//   } catch (error) {
//     console.error(
//       "Error refreshing Reddit token:",
//       error.response?.data || error.message
//     );
//     throw new Error("Failed to refresh Reddit token");
//   }
// };

// // Function to create an Axios instance with OAuth headers and retry logic
// const createRedditAxiosInstance = async (userId) => {
//   const user = await User.findById(userId);
//   if (!user || !user.redditAccessToken || !user.redditRefreshToken) {
//     throw new Error("Reddit account not connected");
//   }

//   // Refresh token if expired or about to expire within 1 minute
//   if (new Date(user.redditTokenExpiry) <= Date.now() + 60000) {
//     await refreshRedditToken(user);
//   }

//   const redditAxios = axios.create({
//     baseURL: "https://oauth.reddit.com",
//     headers: {
//       "User-Agent": REDDIT_USER_AGENT,
//       Authorization: `Bearer ${user.redditAccessToken}`,
//     },
//     timeout: 60000, // 60 seconds
//   });

//   // Configure axios-retry
//   axiosRetry(redditAxios, {
//     retries: 3, // Number of retry attempts
//     retryDelay: axiosRetry.exponentialDelay, // Exponential backoff
//     retryCondition: (error) => {
//       // Retry on network errors or 5xx status codes
//       return (
//         axiosRetry.isNetworkError(error) ||
//         axiosRetry.isRetryableError(error) ||
//         error.code === "ECONNABORTED"
//       );
//     },
//     onRetry: (retryCount, error, requestConfig) => {
//       console.warn(
//         `Retrying request to ${requestConfig.url}. Attempt ${retryCount}`
//       );
//     },
//   });

//   return redditAxios;
// };

// // Search subreddits using Axios with retry logic
// const searchSubreddits = async (userId, query, limit = 10) => {
//   try {
//     console.log(
//       `Searching subreddits for userId: ${userId}, query: "${query}"`
//     );
//     const redditAxios = await createRedditAxiosInstance(userId);

//     const response = await redditAxios.get("/subreddits/search", {
//       params: {
//         q: query,
//         limit,
//         raw_json: 1,
//       },
//     });

//     const results = response.data.data.children.map((child) => child.data);

//     return results.map((subreddit) => ({
//       id: subreddit.id,
//       name: subreddit.display_name,
//       title: subreddit.title,
//       description: subreddit.public_description,
//       subscribers: subreddit.subscribers,
//       created: subreddit.created_utc,
//       url: `https://www.reddit.com/r/${subreddit.display_name}`,
//     }));
//   } catch (error) {
//     console.error(
//       "Error searching subreddits:",
//       error.response?.data || error.message
//     );
//     if (error.message === "Failed to refresh Reddit token") {
//       throw new Error(
//         "Reddit authentication expired. Please reconnect your Reddit account."
//       );
//     }
//     if (error.code === "ECONNABORTED") {
//       throw new Error(
//         "Request to Reddit API timed out. Please try again later."
//       );
//     }
//     throw new Error("Request to Reddit API failed.");
//   }
// };

// // Get subreddit posts using Axios with retry logic
// const getSubredditPosts = async (
//   userId,
//   subreddit,
//   sort = "hot",
//   limit = 25
// ) => {
//   try {
//     console.log(
//       `Fetching posts from subreddit: ${subreddit}, sort: ${sort}, userId: ${userId}`
//     );
//     const redditAxios = await createRedditAxiosInstance(userId);

//     const response = await redditAxios.get(`/r/${subreddit}/${sort}`, {
//       params: {
//         limit,
//         raw_json: 1,
//       },
//     });

//     const posts = response.data.data.children.map((child) => child.data);

//     return posts.map((post) => ({
//       id: post.id,
//       title: post.title,
//       author: post.author.name,
//       score: post.score,
//       num_comments: post.num_comments,
//       created: post.created_utc,
//       url: post.url,
//       permalink: `https://www.reddit.com${post.permalink}`,
//       selftext: post.selftext,
//     }));
//   } catch (error) {
//     console.error(
//       "Error fetching subreddit posts:",
//       error.response?.data || error.message
//     );
//     if (error.message === "Failed to refresh Reddit token") {
//       throw new Error(
//         "Reddit authentication expired. Please reconnect your Reddit account."
//       );
//     }
//     if (error.code === "ECONNABORTED") {
//       throw new Error(
//         "Request to Reddit API timed out. Please try again later."
//       );
//     }
//     throw new Error("Request to Reddit API failed.");
//   }
// };

// // Apply rate limiting to the functions
// export const searchSubredditsLimited = limiter.wrap(searchSubreddits);
// export const getSubredditPostsLimited = limiter.wrap(getSubredditPosts);

// // Update user's search history
// export const updateUserSearchHistory = async (userId, searchTerm) => {
//   let redditSearch = await RedditSearch.findOne({ user: userId });

//   if (!redditSearch) {
//     redditSearch = new RedditSearch({ user: userId, searchTerms: [] });
//   }

//   redditSearch.searchTerms.unshift({ term: searchTerm });
//   if (redditSearch.searchTerms.length > 5) {
//     redditSearch.searchTerms = redditSearch.searchTerms.slice(0, 5);
//   }

//   await redditSearch.save();
// };

// // Retrieve user's search history
// export const getUserSearchHistory = async (userId) => {
//   const redditSearch = await RedditSearch.findOne({ user: userId });
//   return redditSearch ? redditSearch.searchTerms : [];
// };

// // Decrement user's available Reddit requests
// export const decrementRedditRequests = async (userId) => {
//   const user = await User.findById(userId);
//   if (user.num_reddit_req > 0) {
//     user.num_reddit_req -= 1;
//     await user.save();
//     return true;
//   }
//   return false;
// };
