import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";

const execFileAsync = promisify(execFile);

export const generateGermanSpeech = async (
  text: string,
  outputPath: string
): Promise<void> => {
  const pythonBin = process.env.PYTHON_BIN || "python";

  const scriptPath = path.join(
    process.cwd(),
    "python",
    "generate_speech.py"
  );

  try {
    await execFileAsync(
      pythonBin,
      [scriptPath, text, outputPath],
      {
        windowsHide: true,
      }
    );
  } catch (error: any) {
    console.error("gTTS Error:", error?.stderr || error);

    throw new Error("Failed to generate German pronunciation");
  }
};