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
    spellingScore: {
      type: "number",
       description:
    "Score from 0 to 100 for spelling and punctuation."
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
    "spellingScore",
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
You are a professional German language teacher evaluating a German learner's writing.

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

Your job is to evaluate the student's German fairly, accurately, and consistently.

========================
SCORING RUBRIC
========================

Calculate the overall score from 0 to 100 using these factors:

- Task fulfillment: 40%
- Grammar: 30%
- Vocabulary: 20%
- Spelling and punctuation: 10%

For task fulfillment:
- Check whether the student addressed the requested topic/instructions.
- Check the required word count.
- Being below the minimum word count should reduce task fulfillment.
- Do not give an extremely low score only because the answer is short if the German itself is otherwise understandable and accurate.

For grammar:
- Evaluate sentence structure, word order, verb forms, cases, articles, adjective endings, prepositions, and subordinate clauses.
- Only report genuine grammar errors.

For vocabulary:
- Evaluate whether words are correct and appropriate for the intended meaning.
- Do NOT mark a word as a vocabulary error merely because another word is more natural.
- If the student's word is grammatically possible and understandable, do not label it as incorrect.
- You may optionally suggest a more natural alternative, but clearly explain that the original is not necessarily wrong.
- Do not report vocabulary feedback for every small stylistic preference.

VOCABULARY STRICTNESS:
Do not flag "gehen" as incorrect simply because "fahren" or "reisen" may be more natural.

"gehen" can also mean "to go" depending on context.
Only flag it as a vocabulary error if the word clearly expresses the wrong meaning in the student's sentence.

For example:
- "Ich gehe nach Berlin." is grammatically acceptable.
- "Ich fahre nach Berlin." may be more natural when travelling by vehicle.
Do not treat "gehen" as an error merely because "fahren" is a better stylistic choice.

For spelling and punctuation:
- Check spelling, umlauts, capitalization, commas, periods, and spacing.

IMPORTANT:
- Do not invent mistakes.
- Do not over-correct.
- Do not change the student's intended meaning.
- Do not duplicate the same mistake in multiple categories unless the issues are genuinely different.
- A correction should be reported only when it improves correctness, not merely style.

========================
LANGUAGE RULES
========================

The student is learning German but uses an English-based learning interface.

Therefore:

1. correctedText MUST be in German.
2. original MUST contain the student's original German.
3. correction MUST contain the corrected German.
4. suggestion MUST contain a German alternative.
5. ALL explanations MUST be in English.
6. The overall feedback MUST be in English.
7. grammarErrors[].explanation MUST be in English.
8. vocabularyFeedback[].explanation MUST be in English.
9. Keep explanations simple and educational.
10. Never explain an error in German.

========================
GRAMMAR ERRORS
========================

Only include real grammar/spelling/punctuation errors.

For every error:
- original = exact incorrect text from the student
- correction = corrected German
- explanation = simple English explanation

Do not report something as a grammar error when it is merely a stylistic preference.

========================
VOCABULARY FEEDBACK
========================

Only include vocabulary feedback when useful.

A vocabulary suggestion is appropriate when:
- the word is incorrect,
- the word does not express the intended meaning,
- or another word is significantly more appropriate in the context.

Do NOT treat a possible alternative as a required correction.

For example:

Bad interpretation:
"gehen" → "fahren"
Explanation: "'gehen' is wrong."

Better interpretation:
"'gehen' is grammatically possible here, but 'fahren' may be more natural if the learner means travelling by transport."

If there is no meaningful vocabulary problem, return an empty vocabularyFeedback array.

========================
CORRECTED TEXT
========================

Rewrite the complete student answer in natural, grammatically correct German.

Rules:
- Preserve the student's original meaning.
- Do not invent unnecessary details.
- Do not significantly expand the content.
- Correct grammar, spelling, punctuation, and clearly inappropriate vocabulary.
- Keep the text appropriate for the learner's level.

========================
OVERALL FEEDBACK
========================

Write a concise English feedback summary.

Include:
- main strengths,
- main weaknesses,
- one or two practical improvement suggestions.

========================
OUTPUT
========================

Return ONLY valid JSON matching the provided response schema.
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