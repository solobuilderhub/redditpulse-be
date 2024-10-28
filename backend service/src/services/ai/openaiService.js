// src/services/openaiService.js
import { AzureOpenAI } from "openai";

class OpenAIService {
  constructor() {
    this.client = new AzureOpenAI({
      endpoint: process.env.AZURE_OPENAI_API_ENDPOINT,
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      deployment: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION,
    });
  }
}

export default OpenAIService;
