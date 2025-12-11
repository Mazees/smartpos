import Groq from "groq-sdk";

export async function handler(event, context) {
  try {
    console.log(`[Function] Method: ${event.httpMethod}`);

    // Handle GET requests (browser visit)
    if (event.httpMethod === "GET") {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Groq Function is Ready. Use POST to chat.",
        }),
      };
    }

    if (!event.body) {
      throw new Error("Missing request body");
    }

    const { message } = JSON.parse(event.body);
    console.log(`[Function] Received message: ${message?.substring(0, 50)}...`);

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error("[Function] Error: GROQ_API_KEY is missing");
      throw new Error("Server configuration error: Missing API Key");
    }

    const groq = new Groq({ apiKey });

    const response = await groq.chat.completions.create({
      messages: [{ role: "user", content: message }],
      model: "openai/gpt-oss-120b",
    });

    const content = response.choices?.[0]?.message?.content || "";
    console.log("[Function] Success, returning response.");

    return {
      statusCode: 200,
      body: JSON.stringify({
        text: content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim(),
      }),
    };
  } catch (err) {
    console.error(`[Function] Error: ${err.message}`);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
