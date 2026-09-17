import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    "GEMINI_API_KEY is not configured"
  );
}

const ai = new GoogleGenAI({
  apiKey,
});

interface ConversationHistoryItem {
  role: "user" | "model";
  content: string;
}

export const generateGermanConversationReply =
  async (data: {
    practice: {
      title: string;
      instruction: string;
      prompt?: string | null;
    };
    history: ConversationHistoryItem[];
    userMessage: string;
  }) => {
    const historyText =
      data.history.length > 0
        ? data.history
            .map(
              (message) =>
                `${
                  message.role === "user"
                    ? "Student"
                    : "AI"
                }: ${message.content}`
            )
            .join("\n")
        : "No previous conversation.";

    const prompt = `
You are a friendly German conversation partner and German teacher.

The student is learning German and wants to practice speaking.

PRACTICE TITLE:
${data.practice.title}

INSTRUCTION:
${data.practice.instruction}

INITIAL TOPIC:
${data.practice.prompt ?? "Start a simple German conversation."}

CONVERSATION HISTORY:
${historyText}

LATEST STUDENT MESSAGE:
${data.userMessage}

Rules:
1. Reply primarily in German.
2. Keep your German appropriate for the learner's level.
3. Continue the conversation naturally.
4. Ask ONE relevant follow-up question when appropriate.
5. Do not give long grammar lectures during the conversation.
6. Do not interrupt the conversation with too many corrections.
7. If the student's sentence has a clear and important German error, you may briefly provide the corrected form.
8. Do not correct every stylistic preference.
9. Preserve the natural flow of the conversation.
10. Do not switch to English unless the student clearly needs help.
11. Keep each response reasonably short so the student can continue speaking.
12. Do not invent personal information about the student.

Return only the AI's conversational response as plain text.
`;

    const response =
      await ai.models.generateContent({
        model:
          process.env.GEMINI_SPEAKING_MODEL ||
          "gemini-3.5-flash",

        contents: prompt,
        config: {
          temperature: 0.5,
        },
      });

    if (!response.text) {
      throw new Error(
        "Gemini returned an empty conversation response"
      );
    }

    return response.text.trim();
  };