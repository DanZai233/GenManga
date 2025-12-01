export interface ComicPanel {
  id: number;
  visualPrompt: string; // The prompt sent to the image generator
  dialogue: string;
  caption: string;
  imageData?: string; // Base64 string of the image
  status: 'pending' | 'generating' | 'completed' | 'failed';
  error?: string;
}

export interface ComicStory {
  title: string;
  panels: ComicPanel[];
}

export enum GeminiModel {
  FLASH_TEXT = 'gemini-2.5-flash',
  FLASH_IMAGE = 'gemini-2.5-flash-image', // Nano banana
}

export interface ImageEditRequest {
  image: string; // base64
  prompt: string;
}
