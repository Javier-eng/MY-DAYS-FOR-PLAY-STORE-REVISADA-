import { GoogleGenAI, Type } from "@google/genai";

/**
 * Gets AI-suggested reminder offsets in days.
 */
export const getSmartReminderSuggestions = async (title: string, category: string, language: 'en' | 'es') => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Suggest the most useful reminder days before (as numbers) for this task: "${title}" in category "${category}". Language: ${language}. Context: Typical renewal periods for documents or birthday planning.`,
      config: {
        maxOutputTokens: 100,
        thinkingConfig: { thinkingBudget: 50 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.INTEGER },
          description: "List of days before the event to trigger reminders."
        }
      }
    });
    const text = response.text || "[]";
    const result = JSON.parse(text);
    return Array.isArray(result) ? result : [1, 7, 30];
  } catch (error) {
    console.error("AI Error:", error);
    return [1, 7, 30];
  }
};

/**
 * Generates AI schedule summary for the user.
 */
export const getAIScheduleSummary = async (events: any[], language: 'en' | 'es') => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const eventsStr = JSON.stringify(events.slice(0, 5));
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on these upcoming events: ${eventsStr}, write a very short, friendly 1-sentence summary or tip. Language: ${language}. Be encouraging and concise.`,
    });
    return response.text;
  } catch (error) {
    return null;
  }
};

/**
 * Generates Gift Ideas based on a birthday event.
 */
export const getGiftIdeas = async (name: string, notes: string, language: 'en' | 'es') => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide 3 creative and varied gift ideas for ${name}. Context/Notes: ${notes}. Language: ${language}. Keep it brief.`,
    });
    return response.text;
  } catch (error) {
    return null;
  }
};

/**
 * Generates a high-quality Marketing Asset using a custom prompt.
 */
export const generateMarketingAsset = async (
  prompt: string, 
  aspectRatio: "1:1" | "16:9" | "9:16", 
  base64Image?: string
) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const parts: any[] = [];
    if (base64Image) {
      const cleanBase64 = base64Image.split(',')[1] || base64Image;
      parts.push({ inlineData: { data: cleanBase64, mimeType: "image/png" } });
      parts.push({ text: `Based on the provided image, generate an alternative version following this description: ${prompt}` });
    } else {
      parts.push({ text: prompt });
    }
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: { imageConfig: { aspectRatio: aspectRatio } }
    });
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Image Generation Error:", error);
    return null;
  }
};