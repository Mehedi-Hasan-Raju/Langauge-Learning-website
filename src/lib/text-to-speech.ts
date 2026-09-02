import textToSpeech from "@google-cloud/text-to-speech";

const client =
  new textToSpeech.TextToSpeechClient();

export const generateGermanSpeech = async (
  text: string
) => {
  const request = {
    input: {
      text,
    },

    voice: {
      languageCode: "de-DE",
      ssmlGender: "NEUTRAL" as const,
    },

    audioConfig: {
      audioEncoding:
        "MP3" as const,
    },
  };

  const [response] =
    await client.synthesizeSpeech(request);

  if (!response.audioContent) {
    throw new Error(
      "Failed to generate pronunciation audio"
    );
  }

  return response.audioContent;
};