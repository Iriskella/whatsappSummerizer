export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Invalid messages payload" });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  const prompt = `
Summarize the following WhatsApp messages in short bullet points. Focus on key ideas and action items:

${messages.join("\n")}
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
      }),
    });

    const data = await response.json();
    const summary =
      data.choices?.[0]?.message?.content ?? "No summary generated.";

    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json({ summary });
  } catch (error) {
    console.error("Error:", error);
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(500).json({ error: "Internal server error" });
  }
}

// ✅ This makes sure OPTIONS requests are not dropped
export const config = {
  api: {
    bodyParser: true,
    externalResolver: true,
  },
};
