import mongoose from 'mongoose';

const promptSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

const Prompt= mongoose.model('Prompt', promptSchema);

export default Prompt;