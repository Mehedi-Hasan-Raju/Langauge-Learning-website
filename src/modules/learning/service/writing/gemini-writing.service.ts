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

Evaluate the student's German writing carefully.

SCORING:
1. Give an overall score from 0 to 100.
2. Evaluate task fulfillment.
3. Evaluate grammar accuracy.
4. Evaluate vocabulary quality.
5. Consider the required word count when evaluating task fulfillment.
6. Do not give a very low score only because of a short answer if the written German itself is otherwise correct.
7. Score fairly according to the learner's actual performance.

LANGUAGE RULES:
1. "correctedText" MUST be written in German.
2. "original" MUST contain the student's original German text.
3. "correction" MUST contain the corrected German text.
4. "suggestion" MUST contain the suggested German word, phrase, or sentence.
5. ALL explanations must be written in ENGLISH.
6. "feedback" MUST be written in ENGLISH.
7. "grammarErrors[].explanation" MUST be written in ENGLISH.
8. "vocabularyFeedback[].explanation" MUST be written in ENGLISH.
9. Do not write explanations in German.
10. Keep the English explanations simple and understandable for a German learner.
11. Preserve the student's intended meaning when correcting.
12. Do not invent mistakes that are not actually present.
13. Only correct real grammar, spelling, vocabulary, punctuation, or word-order problems.
14. If something is correct, do not mark it as an error.

GRAMMAR ERROR FORMAT:
For each real grammar or spelling error:
- original = the incorrect German text
- correction = the corrected German text
- explanation = a clear English explanation of why it was wrong

VOCABULARY FEEDBACK FORMAT:
- original = student's German word or phrase
- suggestion = a better German word or phrase
- explanation = clear English explanation of why the suggestion is better

CORRECTED TEXT:
Rewrite the student's complete answer in correct natural German.
Do not add unnecessary information.
Keep the original meaning.

FEEDBACK:
Give a short overall evaluation in English.
Mention the main strengths and weaknesses.
Give practical advice for improvement.

IMPORTANT:
Return ONLY valid JSON matching the provided schema.
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