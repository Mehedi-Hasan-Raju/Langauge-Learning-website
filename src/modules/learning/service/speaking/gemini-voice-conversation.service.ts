import { GoogleGenAI } from "@google/genai";

const apiKey =
  process.env.GEMINI_API_KEY;

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

export const transcribeAndReplyToVoice =
  async (data: {
    audioBuffer: Buffer;
    mimeType: string;

    practice: {
      title: string;
      instruction: string;
      prompt?: string | null;
    };

    history: ConversationHistoryItem[];
  }) => {
    const base64Audio =
      data.audioBuffer.toString(
        "base64"
      );

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
You are a friendly German conversation partner
for a German language learner.

PRACTICE:
${data.practice.title}

INSTRUCTION:
${data.practice.instruction}

TOPIC:
${data.practice.prompt ?? "General German conversation"}

PREVIOUS CONVERSATION:
${historyText}

The attached audio contains the student's latest spoken German response.

Your tasks:

1. Carefully understand the audio.
2. Transcribe what the student actually said in German.
3. Do not invent words that were not spoken.
4. Preserve the student's intended meaning.
5. Continue the conversation naturally.
6. Reply in simple German appropriate for a learner.
7. Ask one relevant follow-up question.
8. Do not give a long grammar lesson.
9. If there is an important grammar error, you may briefly give the corrected sentence.
10. Do not correct harmless stylistic differences.
11. Keep the response reasonably short.

Return ONLY valid JSON:

{
  "transcript": "German transcript of the student",
  "reply": "German reply from the AI",
  "correction": "Corrected German sentence if an important correction is needed, otherwise empty string"
}

Do not use English in transcript, reply, or correction.
`;

    const response =
      await ai.models.generateContent({
        model:
          process.env.GEMINI_SPEAKING_MODEL ||
          "gemini-2.5-flash",

        contents: [
          {
            text: prompt,
          },
          {
            inlineData: {
              mimeType: data.mimeType,
              data: base64Audio,
            },
          },
        ],

        config: {
          responseMimeType:
            "application/json",

          responseSchema: {
            type: "object",
            properties: {
              transcript: {
                type: "string",
              },

              reply: {
                type: "string",
              },

              correction: {
                type: "string",
              },
            },

            required: [
              "transcript",
              "reply",
              "correction",
            ],
          },

          temperature: 0.4,
        },
      });

    if (!response.text) {
      throw new Error(
        "Gemini returned an empty voice response"
      );
    }

    try {
      return JSON.parse(
        response.text
      );
    } catch {
      throw new Error(
        "Gemini returned invalid voice conversation JSON"
      );
    }
  };