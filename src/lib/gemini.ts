import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set. Please add it to your secrets.");
  }
  return new GoogleGenAI({ apiKey });
};

export type ToolType = 
  | "writer" 
  | "summarizer" 
  | "translator" 
  | "ideas" 
  | "code" 
  | "email" 
  | "image";

export async function runAITask(type: ToolType, input: string, options?: any) {
  const ai = getAI();
  
  let model = "gemini-3-flash-preview";
  let systemInstruction = "";
  let prompt = input;

  switch (type) {
    case "writer":
      systemInstruction = "You are a professional writer. Write a long-form, polished, and engaging piece of content. Use proper formatting, headings, and clear structure.";
      break;
    case "summarizer":
      systemInstruction = "You are an expert at condensing information. Provide a one-sentence 'TL;DR' followed by a concise list of key points.";
      break;
    case "translator":
      const targetLang = options?.targetLanguage || "English";
      systemInstruction = `Auto-detect the source language and translate the text to ${targetLang}. Maintain the tone and context. Only output the translation.`;
      break;
    case "ideas":
      systemInstruction = "You are a creative strategist. Provide exactly 8 distinct, innovative, and brainstormed ideas or directions based on the topic. Number them 1-8.";
      break;
    case "code":
      model = "gemini-3.1-pro-preview"; // Use pro for coding
      systemInstruction = "You are an expert software engineer. Provide high-quality, efficient, and runnable code snippets. Explain the logic clearly but concisely.";
      break;
    case "email":
      systemInstruction = "You are a professional communication expert. Draft a concise, polished, and professional email based on the context. Include a subject line.";
      break;
    case "image":
      model = "gemini-2.5-flash-image";
      const response = await ai.models.generateContent({
        model,
        contents: { parts: [{ text: input }] },
        config: {
          imageConfig: {
            aspectRatio: options?.aspectRatio || "1:1",
          }
        }
      });
      
      const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (imagePart?.inlineData) {
        return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
      }
      throw new Error("Failed to generate image");
  }

  const response: GenerateContentResponse = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction,
    },
  });

  return response.text;
}
