import { GoogleGenAI } from "@google/genai";
import { GEMINI_MODEL_ID } from "../constants";

// Convert file to base64
const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const processImageWithGemini = async (
  apiKey: string, 
  file: File,
  systemInstruction: string
): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing");

  const ai = new GoogleGenAI({ apiKey });

  try {
    const base64Data = await fileToGenerativePart(file);
    
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_ID,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data
            }
          },
          {
            text: "Extract and rewrite the dialogue from this comic page following the system instructions."
          }
        ]
      },
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3, // Low temperature for more faithful transcription
      }
    });

    return response.text || "No dialogue detected.";

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to process image");
  }
};