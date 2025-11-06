import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Scene } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY ortam değişkeni ayarlanmadı");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const sceneSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      scene: {
        type: Type.INTEGER,
        description: "Sahne numarası, 1'den başlayarak.",
      },
      description: {
        type: Type.STRING,
        description: "Sahnenin, bir resim oluşturma istemi için uygun, ayrıntılı bir görsel açıklaması. Karakterlere, mekana, eyleme ve ruh haline odaklanın.",
      },
    },
    required: ["scene", "description"],
  },
};

export const parseScriptToScenes = async (script: string): Promise<Scene[]> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Aşağıdaki senaryoyu sahne dizisine ayır. Her sahne için, bir resim oluşturucu için girdi olarak kullanılabilecek ayrıntılı bir görsel açıklama sağla. Yalnızca JSON dizisini çıktı olarak ver. Senaryo: \n\n${script}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: sceneSchema,
      },
    });
    
    const jsonString = response.text;
    const parsedScenes = JSON.parse(jsonString);

    if (!Array.isArray(parsedScenes)) {
        throw new Error("API geçerli bir sahne dizisi döndürmedi.");
    }

    return parsedScenes.map((s: any) => ({
        scene: s.scene,
        description: s.description,
        isGenerating: false,
    }));
  } catch (error) {
    console.error("Senaryo sahnelere ayrıştırılırken hata oluştu:", error);
    throw new Error("Senaryo ayrıştırılamadı. Lütfen senaryo formatını kontrol edip tekrar deneyin.");
  }
};

export const generateImageForScene = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `Türkiye'de geçen sinematik bir sahne için storyboard paneli oluştur. Karakterler ve ortam Türk kültürüne uygun olsun. Sahne açıklaması: ${prompt}. Stil: dinamik, etkileyici, net kompozisyon.`,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            throw new Error("API tarafından hiçbir görsel oluşturulmadı.");
        }
    } catch(error) {
        console.error("Görsel oluşturulurken hata oluştu:", error);
        throw new Error("Sahne için görsel oluşturulamadı.");
    }
};