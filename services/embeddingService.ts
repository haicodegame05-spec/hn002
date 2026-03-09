
import { GoogleGenAI } from "@google/genai";

export class EmbeddingService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  }

  /**
   * Generates an embedding for the given text using gemini-embedding-001.
   */
  public async getEmbedding(text: string): Promise<number[]> {
    try {
      const result = await this.ai.models.embedContent({
        model: "gemini-embedding-001",
        contents: [{ parts: [{ text }] }]
      });
      // embedContent returns { embeddings: EmbedData[] }
      return result.embeddings[0].values;
    } catch (error) {
      console.error("Error generating embedding:", error);
      // Return a zero vector or handle as needed to prevent crashes
      return new Array(768).fill(0); 
    }
  }

  /**
   * Calculates cosine similarity between two vectors.
   */
  public cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

export const embeddingService = new EmbeddingService();
