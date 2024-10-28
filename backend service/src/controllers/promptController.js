import Prompt from '../models/Prompt.js';

// Create a new prompt
export const createPrompt = async (req, res) => {
  try {
    const { text, name } = req.body;
    const userId = req.user.id;
    const prompt = new Prompt({ text, name, userId });
    await prompt.save();
    res.status(201).json(prompt);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get a prompt by ID
export const getPrompt = async (req, res) => {
  try {
    const prompt = await Prompt.findOne({ _id: req.params.id, userId: req.user.id });
    if (!prompt) return res.status(404).json({ message: 'Prompt not found' });
    res.json(prompt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a prompt
export const updatePrompt = async (req, res) => {
  try {
    const { text, name } = req.body;
    const prompt = await Prompt.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { text, name },
      { new: true }
    );
    if (!prompt) return res.status(404).json({ message: 'Prompt not found' });
    res.json(prompt);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a prompt
export const deletePrompt = async (req, res) => {
  try {
    const prompt = await Prompt.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!prompt) return res.status(404).json({ message: 'Prompt not found' });
    res.json({ message: 'Prompt deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all prompts for a user
export const getUserPrompts = async (req, res) => {
  try {
    const userId = req.user.id;
    const prompts = await Prompt.find({ userId });
    res.json(prompts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};