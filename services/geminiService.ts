
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Quiz, Question } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Generates a quiz based on a topic using Search Grounding for accuracy.
 */
export const generateQuiz = async (topic: string): Promise<Quiz> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Create a comprehensive 5-question multiple-choice quiz about "${topic}". 
    Ensure the questions are accurate, up-to-date, and challenging. 
    Include clear explanations for why the correct answer is right.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                options: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "Must contain exactly 4 options"
                },
                correctIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING }
              },
              required: ["text", "options", "correctIndex", "explanation"]
            }
          }
        },
        required: ["title", "questions"]
      }
    }
  });

  const data = JSON.parse(response.text);
  
  // Add IDs and metadata
  return {
    id: Math.random().toString(36).substr(2, 9),
    title: data.title,
    topic,
    createdAt: Date.now(),
    questions: data.questions.map((q: any, i: number) => ({
      ...q,
      id: `q-${i}`
    }))
  };
};

/**
 * Edits an image using Gemini 2.5 Flash Image.
 */
export const editImage = async (base64Image: string, prompt: string, mimeType: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType } },
        { text: prompt }
      ]
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image data returned from model");
};

/**
 * Handles complex chat queries with Thinking Mode.
 */
export const chatWithThinking = async (prompt: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 32768 }
    }
  });
  return response.text || "I'm sorry, I couldn't generate a response.";
};

/**
 * Regular chat for assistant features.
 */
export const startChatSession = (systemInstruction?: string) => {
  const ai = getAI();
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: systemInstruction || "You are a helpful and intelligent quiz and learning assistant."
    }
  });
};
