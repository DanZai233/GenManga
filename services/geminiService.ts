import { GoogleGenAI, Type } from "@google/genai";
import { ComicStory, ComicPanel, GeminiModel } from '../types';

const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey });

export const generateComicScript = async (userPrompt: string, pageCount: number = 4): Promise<ComicStory> => {
  const prompt = `
    You are a professional comic book writer.
    Create a script for a ${pageCount}-panel comic based on this request: "${userPrompt}".
    
    The output must be a valid JSON object representing the comic story.
    Focus on visual descriptions that are vivid and suitable for an AI image generator.
    Include dialogue and captions for each panel.
  `;

  const response = await ai.models.generateContent({
    model: GeminiModel.FLASH_TEXT,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          panels: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER },
                visualPrompt: { type: Type.STRING, description: "Detailed visual description for image generation. Include style (e.g. Anime, Manga, Doraemon style), colors, setting, and action." },
                dialogue: { type: Type.STRING, description: "Character speech bubbles" },
                caption: { type: Type.STRING, description: "Narrator box text" }
              },
              required: ["id", "visualPrompt", "dialogue", "caption"]
            }
          }
        },
        required: ["title", "panels"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No script generated");
  
  const data = JSON.parse(text);
  
  // Map to internal type ensuring status is set
  return {
    title: data.title,
    panels: data.panels.map((p: any) => ({
      ...p,
      status: 'pending'
    }))
  };
};

export const generatePanelImage = async (visualPrompt: string, referenceImageBase64?: string): Promise<string> => {
  try {
    const parts: any[] = [];
    
    // Add reference image if provided
    if (referenceImageBase64) {
      // Ensure we strip the data URL prefix if it exists
      const base64Data = referenceImageBase64.includes('base64,') 
        ? referenceImageBase64.split('base64,')[1] 
        : referenceImageBase64;
        
      parts.push({
        inlineData: {
          mimeType: 'image/png', // Defaulting to png, but the model is flexible
          data: base64Data
        }
      });
    }

    parts.push({ text: visualPrompt });

    const response = await ai.models.generateContent({
      model: GeminiModel.FLASH_IMAGE,
      contents: { parts },
      config: {
        // Nano banana (flash-image) specific configs if needed
      }
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        return part.inlineData.data;
      }
    }
    throw new Error("No image data returned in response");
  } catch (error) {
    console.error("Image generation error:", error);
    throw error;
  }
};

export const editPanelImage = async (imageBase64: string, editPrompt: string): Promise<string> => {
  try {
    const base64Data = imageBase64.includes('base64,') 
      ? imageBase64.split('base64,')[1] 
      : imageBase64;

    const response = await ai.models.generateContent({
      model: GeminiModel.FLASH_IMAGE,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png', // Assuming PNG for simplicity, though API supports others
              data: base64Data
            }
          },
          { text: editPrompt }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        return part.inlineData.data;
      }
    }
    throw new Error("No edited image data returned");
  } catch (error) {
    console.error("Image edit error:", error);
    throw error;
  }
};
