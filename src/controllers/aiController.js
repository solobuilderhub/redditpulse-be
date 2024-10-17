import { streamAIResponse } from "../services/aiService.js";
import { getPersonaDetails } from "../services/personaService.js";
import { generatePrompt } from "../utils/promptGenerator.js";
import User from "../models/User.js";
import Prompt from "../models/Prompt.js";

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

    // Stream the AI response
    // return res.json({ message: generatedPrompt });

    const systemPrompt = `
    You are an AI assistant specialized in generating engaging and professional comments for LinkedIn posts. 
    
    ### Instructions:
    You will receive a <UserPersona> and a <PostContext> as part of the prompt. Your task is to generate a LinkedIn comment based on the provided post and tone.
    
    - Your responses should be tailored to the user's persona, maintaining authenticity and relevance. 
    - Always strive to add value to the conversation, show genuine interest, and foster meaningful interactions while adhering to LinkedIn etiquette.
    
    ### Guidelines:
      1. Write a concise comment relevant to the post.
      2. Add value by sharing insights, asking thoughtful questions, or providing a unique perspective.
      3. If applicable, address any questions or calls-to-action from the end of the post.
      4. Ensure your comment is engaging and encourages further discussion.
    `;
    await streamAIResponse(systemPrompt, generatedPrompt, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
