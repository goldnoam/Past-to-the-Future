
import { GoogleGenAI, Modality } from "@google/genai";

export interface GenerativePart {
  mimeType: string;
  data: string;
  dataUrl: string;
}

export const fileToGenerativePart = (file: File): Promise<GenerativePart> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const parts = dataUrl.split(';');
      const mimeType = parts[0].split(':')[1];
      const data = parts[1].split(',')[1];
      resolve({ mimeType, data, dataUrl });
    };
    reader.onerror = (error) => reject(error);
  });
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateImage = async (
  imageData: { mimeType: string; data: string },
  prompt: string
): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: imageData.data,
              mimeType: imageData.mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};
