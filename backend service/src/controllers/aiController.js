import { streamAIResponse } from "../services/ai/aiService.js";
import { getPersonaDetails } from "../services/personaService.js";
import { generatePrompt } from "../utils/promptGenerator.js";
import User from "../models/User.js";
import Prompt from "../models/Prompt.js";
import axios from "axios";

// Helper function to get prompt by ID
const getPromptById = async (promptId, userId) => {
  const prompt = await Prompt.findOne({ _id: promptId, userId: userId });
  return prompt;
};

export const getLinkedInComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { personaId, linkedinPost, promptId } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user has available requests
    if (user.availableRequest <= 0) {
      return res
        .status(403)
        .json({ message: "You have passed your limit of available requests" });
    }

    // Decrement the available requests
    user.availableRequest -= 1;

    // Save the updated user object
    await user.save();

    // Retrieve persona details
    const persona = await getPersonaDetails(personaId);

    let tone = ""; // Initialize finalTone as an empty string

    // Handle promptId if provided
    if (promptId) {
      const promptData = await getPromptById(promptId, userId);
      if (promptData && promptData.text) {
        tone = promptData.text;
      }
    }
    // Generate prompt based on persona, LinkedIn post, and final tone
    const generatedPrompt = generatePrompt(persona, linkedinPost, tone);

    const systemPrompt = `You are an AI that generates authentic Reddit comments. You'll receive:
1. <UserPersona> (his job, experience level, and interests)
2. <PostContext>

Guidelines:
- Match the subreddit's typical tone and culture
- Be conversational and natural
- Add value through humor, insights, or relevant experiences
- Use appropriate Reddit lingo/references when fitting
- Keep responses concise and engaging
- Include relevant emojis/formatting only if it fits the subreddit style

Remember: Sound human, not corporate. Be genuine, not forced.
    `;
    await streamAIResponse(systemPrompt, generatedPrompt, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// generateMeme function
export const generateMeme = async (req, res) => {
  try {
    const userId = req.user.id;
    const { post } = req.body;

    if (!post) {
      return res.status(400).json({ message: "RedditPost is required" });
    }

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user has available requests
    if (user.availableRequest <= 0) {
      return res.status(403).json({
        message: "You have passed your limit of available requests",
      });
    }

    // Call the meme generation API
    const query = `Generate meme based on the following reddit post: ${post}`;
    const response = await axios.post(
      process.env.MEME_API_URL,
      { query },
      {
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.MEME_API_KEY, // Make sure to add this to your .env file
        },
      }
    );

    // Decrement the available requests
    user.availableRequest -= 1;

    // Save the updated user object
    await user.save();

    // Return the meme URL and expiry date
    return res.status(200).json({
      success: true,
      data: {
        url: response.data.url,
        expiryDate: response.data.expiry_date,
      },
    });
  } catch (error) {
    console.error("Meme generation error:", error);

    // Handle specific API errors
    if (error.response) {
      return res.status(error.response.status).json({
        message: "Error generating meme",
        error: error.response.data,
      });
    }

    // Handle general errors
    return res.status(500).json({
      message: "Server error while generating meme",
      error: error.message,
    });
  }
};
