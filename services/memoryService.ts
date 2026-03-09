
import { GoogleGenAI } from "@google/genai";
import { GameLog, MemoryEntry, MemoryState, AiModel } from "../types";
import { embeddingService } from "./embeddingService";

export class MemoryService {
  private state: MemoryState = {
    worldSummary: "Câu chuyện vừa bắt đầu.",
    memories: [],
    lastSummarizedTurn: 0
  };

  /**
   * Cập nhật bộ nhớ dựa trên logs mới
   * Sử dụng AI để trích xuất các "atomic memories" (sự kiện/sự thật nguyên tử)
   */
  public async updateMemory(logs: GameLog[], turnCount: number, force: boolean = false): Promise<void> {
    // Cho phép cập nhật mỗi lượt nếu cần, nhưng vẫn giữ một khoảng nghỉ nhỏ để tránh spam API liên tục trong 1 lượt
    if (!force && turnCount > 0 && turnCount === this.state.lastSummarizedTurn) return;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
    const recentLogs = logs.slice(-20).map(l => `[${l.type.toUpperCase()}] ${l.content}`).join("\n");

    const extractionPrompt = `
      Bạn là một "Quantum Memory Manager". Nhiệm vụ của bạn là trích xuất các ký ức quan trọng từ nhật ký game RPG dưới đây.
      
      NHẬT KÝ GẦN ĐÂY:
      ${recentLogs}

      KÝ ỨC HIỆN TẠI (TÓM TẮT):
      ${this.state.worldSummary}

      HÃY TRÍCH XUẤT (CHỈ KHI THỰC SỰ CẦN THIẾT):
      1. Các sự thật mới (Facts): Về thế giới, địa điểm, quy luật.
      2. Sự kiện quan trọng (Events): Những gì MC đã làm hoặc chứng kiến có tầm ảnh hưởng lâu dài.
      3. Mối quan hệ (Relationships): Thay đổi lớn trong tình cảm hoặc thông tin quan trọng về NPC.
      4. Sở thích/Thói quen (Preferences): Của MC hoặc NPC quan trọng.

      YÊU CẦU QUAN TRỌNG:
      - CHỈ trích xuất nếu có sự kiện thực sự đáng nhớ. Nếu lượt vừa qua chỉ là các hành động lặp lại hoặc không quan trọng, hãy để "extractedMemories" là mảng rỗng [].
      - Mỗi ký ức phải là một câu khẳng định ngắn gọn, độc lập.
      - Loại bỏ các chi tiết thừa thãi.
      - Nếu một ký ức mới cập nhật hoặc mâu thuẫn với ký ức cũ, hãy ghi chú rõ.

      TRẢ VỀ JSON:
      {
        "newWorldSummary": "Bản tóm tắt thế giới mới (ngắn gọn < 150 từ, cập nhật từ bản cũ)",
        "extractedMemories": [
          { "content": "Nội dung ký ức", "type": "fact/event/relationship/preference", "importance": 1-100 }
        ]
      }
    `;

    try {
      const response = await ai.models.generateContent({
        model: AiModel.FLASH_3,
        contents: extractionPrompt,
        config: { responseMimeType: "application/json" }
      });

      if (response.text) {
        const result = JSON.parse(response.text);
        this.state.worldSummary = result.newWorldSummary;
        this.state.lastSummarizedTurn = turnCount;

        if (result.extractedMemories && Array.isArray(result.extractedMemories)) {
          for (const mem of result.extractedMemories) {
            await this.upsertMemory(mem.content, mem.type, mem.importance, turnCount);
          }
        }

        // Tự động ghim ký ức trên 70 điểm và xóa ký ức dưới 70 điểm
        this.state.memories = this.state.memories.filter(m => {
          if (m.metadata.importance > 70) {
            m.metadata.isPinned = true;
            return true;
          }
          return false;
        });

        // Giới hạn số lượng ký ức để tránh quá tải
        if (this.state.memories.length > 200) {
          // Ưu tiên giữ lại ký ức được ghim, sau đó là quan trọng, sau đó là mới nhất
          this.state.memories.sort((a, b) => {
            if (a.metadata.isPinned && !b.metadata.isPinned) return -1;
            if (!a.metadata.isPinned && b.metadata.isPinned) return 1;
            return (b.metadata.importance * 2 + b.metadata.lastUpdated / 1000000) - (a.metadata.importance * 2 + a.metadata.lastUpdated / 1000000);
          });
          this.state.memories = this.state.memories.slice(0, 200);
        }
      }
    } catch (e) {
      console.error("[SEMANTIC_MEMORY]: Update failed:", e);
    }
  }

  /**
   * Thêm hoặc cập nhật một ký ức dựa trên độ tương đồng ngữ nghĩa
   */
  private async upsertMemory(content: string, type: any, importance: number, turn: number): Promise<void> {
    const embedding = await embeddingService.getEmbedding(content);
    
    // Tìm xem có ký ức nào tương tự không (để cập nhật thay vì thêm mới)
    let existingIdx = -1;
    let maxSim = 0;

    for (let i = 0; i < this.state.memories.length; i++) {
      const sim = embeddingService.cosineSimilarity(embedding, this.state.memories[i].embedding);
      if (sim > 0.92) { // Độ tương đồng rất cao, coi như cùng một chủ đề
        if (sim > maxSim) {
          maxSim = sim;
          existingIdx = i;
        }
      }
    }

    const now = Date.now();
    if (existingIdx > -1) {
      // Cập nhật ký ức cũ
      this.state.memories[existingIdx].content = content;
      this.state.memories[existingIdx].embedding = embedding;
      this.state.memories[existingIdx].metadata.lastUpdated = now;
      this.state.memories[existingIdx].metadata.importance = Math.max(this.state.memories[existingIdx].metadata.importance, importance);
      // Giữ nguyên lượt đầu tiên ghi nhớ hoặc cập nhật? Thường là giữ nguyên lượt gốc hoặc cập nhật lượt mới nhất.
      // Ở đây ta giữ nguyên lượt gốc để biết nó bắt đầu từ đâu.
    } else {
      // Thêm ký ức mới
      this.state.memories.push({
        id: Math.random().toString(36).substring(2, 11),
        content,
        embedding,
        metadata: {
          type,
          importance,
          timestamp: now,
          lastUpdated: now,
          turn
        }
      });
    }
  }

  /**
   * Lấy ngữ cảnh bộ nhớ dựa trên hành động hiện tại
   */
  public getMemoryContext(actionEmbedding?: number[]): string {
    let relevantMemories: string[] = [];
    
    if (actionEmbedding && actionEmbedding.length > 0 && this.state.memories.length > 0) {
      const scored = this.state.memories.map(m => ({
        content: m.content,
        score: embeddingService.cosineSimilarity(actionEmbedding, m.embedding)
      }));

      relevantMemories = scored
        .sort((a, b) => b.score - a.score)
        .slice(0, 8) // Lấy top 8 ký ức liên quan nhất
        .filter(m => m.score > 0.7) // Chỉ lấy những cái có liên quan thực sự
        .map(m => `- ${m.content}`);
    }

    return `
      [ WORLD SUMMARY ]:
      ${this.state.worldSummary}

      [ RELEVANT SEMANTIC MEMORIES ]:
      ${relevantMemories.length > 0 ? relevantMemories.join("\n") : "Không có ký ức liên quan trực tiếp."}
    `;
  }

  public setState(state: MemoryState) {
    // Đảm bảo cấu trúc dữ liệu cũ vẫn tương thích nếu có
    this.state = {
      worldSummary: state.worldSummary || "Câu chuyện vừa bắt đầu.",
      memories: state.memories || [],
      lastSummarizedTurn: state.lastSummarizedTurn || 0
    };
  }

  public getState(): MemoryState {
    return this.state;
  }

  public deleteMemory(id: string): void {
    this.state.memories = this.state.memories.filter(m => m.id !== id);
  }

  public togglePin(id: string): void {
    const mem = this.state.memories.find(m => m.id === id);
    if (mem) {
      mem.metadata.isPinned = !mem.metadata.isPinned;
    }
  }

  public bulkDelete(filter: (m: MemoryEntry) => boolean): void {
    this.state.memories = this.state.memories.filter(m => !filter(m));
  }
}

export const memoryService = new MemoryService();
