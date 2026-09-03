import sys
from gtts import gTTS


def main():
    if len(sys.argv) != 3:
        print("Usage: python generate_speech.py <text> <output_path>")
        sys.exit(1)

    text = sys.argv[1]
    output_path = sys.argv[2]

    if not text.strip():
        print("Text cannot be empty")
        sys.exit(1)

    try:
        tts = gTTS(
            text=text,
            lang="de",
            slow=False
        )

        tts.save(output_path)

        print(f"Audio generated successfully: {output_path}")

    except Exception as error:
        print(f"TTS generation failed: {error}")
        sys.exit(1)


if __name__ == "__main__":
    main()