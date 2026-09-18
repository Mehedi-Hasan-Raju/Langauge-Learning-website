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

const speakingEvaluationSchema = {
  type: "object",
  properties: {
    transcript: {
      type: "string",
      description:
        "The German transcript of exactly what the learner said.",
    },

    score: {
      type: "number",
      description:
        "Overall speaking score from 0 to 100.",
    },

    grammarScore: {
      type: "number",
      description:
        "Grammar score from 0 to 100.",
    },

    vocabularyScore: {
      type: "number",
      description:
        "Vocabulary score from 0 to 100.",
    },

    fluencyScore: {
      type: "number",
      description:
        "Fluency score from 0 to 100.",
    },

    feedback: {
      type: "string",
      description:
        "Simple English feedback for the learner.",
    },

    correctedText: {
      type: "string",
      description:
        "Corrected German version of the transcript.",
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
            description:
              "English explanation.",
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
            description:
              "English explanation.",
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
    "transcript",
    "score",
    "grammarScore",
    "vocabularyScore",
    "fluencyScore",
    "feedback",
    "correctedText",
    "grammarErrors",
    "vocabularyFeedback",
  ],
};

export const evaluateGermanSpeaking = async (
  audioBuffer: Buffer,
  mimeType: string,
  practice: {
    title: string;
    instruction: string;
    prompt?: string | null;
    type:
      | "TOPIC"
      | "QUESTION"
      | "AI_CONVERSATION";
  }
) => {
  const base64Audio =
    audioBuffer.toString("base64");

  const prompt = `
You are a professional German language speaking teacher.

Evaluate the German learner's spoken answer.

PRACTICE TYPE:
${practice.type}

TITLE:
${practice.title}

INSTRUCTION:
${practice.instruction}

PROMPT:
${practice.prompt ?? "No specific prompt"}

TASK:
1. Transcribe exactly what the learner said in German.
2. Evaluate grammar.
3. Evaluate vocabulary.
4. Evaluate fluency.
5. Give an overall score from 0 to 100.
6. Correct the learner's German.
7. Identify genuine grammar mistakes.
8. Give useful vocabulary suggestions only when needed.
9. Give all explanations and overall feedback in English.

LANGUAGE RULES:
- transcript MUST be German.
- correctedText MUST be German.
- original MUST preserve the learner's German.
- correction MUST be German.
- suggestion MUST be German.
- ALL explanations MUST be English.
- feedback MUST be English.
- Do not invent mistakes.
- Do not mark stylistic preferences as errors.
- Preserve the learner's intended meaning.
- Do not change tense unless it is actually incorrect.
- Do not mark "gehen" as wrong merely because "fahren" may be more natural.
- If there is no real vocabulary problem, return an empty vocabularyFeedback array.

Return ONLY valid JSON matching the provided schema.
`;

  const response =
    await ai.models.generateContent({
      model:
        process.env.GEMINI_SPEAKING_MODEL ||
        "gemini-3.5-flash",

      contents: [
        {
          text: prompt,
        },
        {
          inlineData: {
            mimeType,
            data: base64Audio,
          },
        },
      ],

      config: {
        responseMimeType:
          "application/json",

        responseSchema:
          speakingEvaluationSchema,

        temperature: 0.2,
      },
    });

  if (!response.text) {
    throw new Error(
      "Gemini returned an empty speaking evaluation"
    );
  }

  let result: any;

  try {
    result = JSON.parse(response.text);
  } catch {
    throw new Error(
      "Gemini returned invalid speaking evaluation JSON"
    );
  }

  return result;
};