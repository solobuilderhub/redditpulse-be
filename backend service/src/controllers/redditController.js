// // src/controllers/redditController.js
// import * as redditService from '../services/redditService.js';

// export const searchSubreddits = async (req, res) => {
//     try {
//       const { query } = req.query;
//     //   console.log('Query:', query);
      
//       const userId = req.user.id;
  
//       const hasRequests = await redditService.decrementRedditRequests(userId);
//       if (!hasRequests) {
//         return res.status(403).json({ message: 'No more Reddit requests available' });
//       }
  
//       const subreddits = await redditService.searchSubredditsLimited(userId, query);
//       await redditService.updateUserSearchHistory(userId, query);
  
//       res.json(subreddits);
//     } catch (error) {
//     //   console.error('Error in searchSubreddits controller:', error.message);
//       if (error.message.includes('Reddit authentication expired')) {
//         return res.status(401).json({ message: 'Reddit authentication expired. Please reconnect your Reddit account.' });
//       }
//       if (error.message.includes('timed out')) {
//         return res.status(504).json({ message: error.message });
//       }
//       res.status(500).json({ message: 'Error searching subreddits', error: error.message });
//     }
//   };
  
//   export const getSubredditPosts = async (req, res) => {
//     // return res.json({ message: 'This route is disabled for the demo', status: 403 });
    
//     try {
//       const { subreddit, sort } = req.params;
//       const userId = req.user.id;
  
//       const hasRequests = await redditService.decrementRedditRequests(userId);
//       if (!hasRequests) {
//         return res.status(403).json({ message: 'No more Reddit requests available' });
//       }
  
//       const posts = await redditService.getSubredditPostsLimited(userId, subreddit, sort);
//       res.json(posts);
//     } catch (error) {
//     //   console.error('Error in getSubredditPosts controller:', error.message);
//       if (error.message.includes('Reddit authentication expired')) {
//         return res.status(401).json({ message: 'Reddit authentication expired. Please reconnect your Reddit account.' });
//       }
//       if (error.message.includes('timed out')) {
//         return res.status(504).json({ message: error.message });
//       }
//       res.status(500).json({ message: 'Error fetching subreddit posts', error: error.message });
//     }
//   };
  
//   export const getUserSearchHistory = async (req, res) => {
//     try {
//       const userId = req.user.id;
//       const searchHistory = await redditService.getUserSearchHistory(userId);
//       res.json(searchHistory);
//     } catch (error) {
//       res.status(500).json({ message: 'Error fetching search history', error: error.message });
//     }
//   };