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

const evaluationSchema = {
  type: "object",
  properties: {
    score: {
      type: "number",
    },

    taskFulfillment: {
      type: "number",
    },

    grammarScore: {
      type: "number",
    },

    vocabularyScore: {
      type: "number",
    },

    feedback: {
      type: "string",
    },

    correctedText: {
      type: "string",
    },

    grammarErrors: {
      type: "array",
      items: {
        type: "object",
        properties: {
          original: {
            type: "string",
          },
          correction: {
            type: "string",
          },
          explanation: {
            type: "string",
          },
        },
        required: [
          "original",
          "correction",
          "explanation",
        ],
      },
    },

    vocabularyFeedback: {
      type: "array",
      items: {
        type: "object",
        properties: {
          original: {
            type: "string",
          },
          suggestion: {
            type: "string",
          },
          explanation: {
            type: "string",
          },
        },
        required: [
          "original",
          "suggestion",
          "explanation",
        ],
      },
    },
  },

  required: [
    "score",
    "taskFulfillment",
    "grammarScore",
    "vocabularyScore",
    "feedback",
    "correctedText",
    "grammarErrors",
    "vocabularyFeedback",
  ],
};

export const evaluateGermanWriting = async (data: {
  taskTitle: string;
  instruction: string;
  type:
    | "EMAIL"
    | "SHORT_MESSAGE";
  minWords?: number | null;
  maxWords?: number | null;
  answer: string;
}) => {
  const prompt = `
You are a professional German language teacher.

Evaluate a German learner's writing.

TASK TYPE:
${data.type}

TASK TITLE:
${data.taskTitle}

INSTRUCTION:
${data.instruction}

WORD LIMIT:
${data.minWords ?? "not specified"} - ${
    data.maxWords ?? "not specified"
  } words

STUDENT ANSWER:
${data.answer}

Evaluate the answer for a German learner.

Rules:
1. Score the answer from 0 to 100.
2. Evaluate whether the student followed the task.
3. Evaluate grammar accuracy.
4. Evaluate vocabulary quality and appropriateness.
5. Identify important grammar mistakes.
6. Suggest better vocabulary where useful.
7. Provide a corrected version of the student's text.
8. Keep explanations simple and useful for a German learner.
9. Do not invent mistakes that are not actually present.
10. Preserve the student's intended meaning when correcting.
11. Return ONLY valid JSON matching the provided schema.
`;

  const response =
    await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType:
          "application/json",
        responseSchema:
          evaluationSchema,
        temperature: 0.2,
      },
    });

  if (!response.text) {
    throw new Error(
      "Gemini returned an empty response"
    );
  }

  let result: any;

  try {
    result = JSON.parse(response.text);
  } catch {
    throw new Error(
      "Gemini returned invalid evaluation JSON"
    );
  }

  return result;
};