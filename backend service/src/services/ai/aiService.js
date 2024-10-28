import OpenAIService from "./openaiService.js";

const aiService = new OpenAIService();

export const streamAIResponse = async (systemPrompt, prompt, res) => {
  res.writeHead(200, {
    "Content-Type": "text/plain",
    "Transfer-Encoding": "chunked",
  });

  // console.log(systemPrompt);
  try {
    const stream = await aiService.client.chat.completions.create({
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
