import Groq from "groq-sdk";

export async function createAiSummary(
  commits: string[],
  apiKey: string
): Promise<string | null> {
  if (!apiKey) {
    throw new Error("Groq API key not provided.");
  }

  try {
    const groq = new Groq({ apiKey });

    const prompt = `You are helping a developer write their weekly summary.
    Here are their commits:
    ${commits.join("\n")}
    
    Write a professional 2-3 sentence summary focusing on accomplishments and impact.`;

    const response = await groq.chat.completions.create({
      messages: [{ content: prompt, role: "user" }],
      model: "llama-3.3-70b-versatile",
    });

    return response.choices[0].message.content;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`AI summary failed: ${error.message}`);
    }
    throw new Error("AI summary failed");
  }
}
