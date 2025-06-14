export default async function handler(req, res) {
  // ✅ Always set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Access-Control-Allow-Origin", "*"); // repeat for safety
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    res.setHeader("Access-Control-Allow-Origin", "*");
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
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
      }),
    });

    const data = await response.json();
    console.log("🔍 OpenAI raw response:", data); // ✅ Add this

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

// ✅ Required to prevent Vercel from skipping OPTIONS
export const config = {
  api: {
    bodyParser: true,
    externalResolver: true,
  },
};
