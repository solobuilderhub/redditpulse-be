// // src/models/RedditSearch.js
// import mongoose from 'mongoose';

// const redditSearchSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },
//     searchTerms: [
//       {
//         term: String,
//         timestamp: {
//           type: Date,
//           default: Date.now,
//         },
//       },
//     ],
//   },
//   {
//     timestamps: true,
//   }
// );

// redditSearchSchema.index({ user: 1 });

// export default mongoose.model('RedditSearch', redditSearchSchema);