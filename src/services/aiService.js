import { AzureOpenAI } from "openai";

const endpoint = process.env.AZURE_OPENAI_API_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const deployment = process.env.AZURE_OPENAI_API_INSTANCE_NAME || "gpt-4o-mini";
const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-08-01-preview";

// Azure OpenAI client
const options = {
  endpoint,
  apiKey,
  deployment,
  apiVersion,
};
const client = new AzureOpenAI(options);

export const streamAIResponse = async (systemPrompt, prompt, res) => {
  res.writeHead(200, {
    "Content-Type": "text/plain",
    "Transfer-Encoding": "chunked",
  });

  // console.log(systemPrompt);
  try {
    const stream = await client.chat.completions.create({
      model: "",
      max_tokens: 300,
      messages: [
        {
          role: "system",
          content: [
            {
              type: "text",
              text: systemPrompt,
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        res.write(content);
      }
    }

    res.end();
  } catch (error) {
    console.error("OpenAI API Error:", error);
    res.write("Error during OpenAI API call");
    res.end();
  }
};
