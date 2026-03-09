
import { Relationship, BodyDescription } from '../types';

export const isValidValue = (val: any): boolean => {
  if (val === undefined || val === null || val === '') return false;
  if (typeof val === 'string') {
    const v = val.trim().toLowerCase();
    return !['??', 'n/a', 'chưa rõ', 'đang cập nhật', 'unknown', 'none', 'đang cập nhật...', 'không rõ', 'ẩn số'].includes(v);
  }
  return true;
};

export const compensateNpcData = (npc: Relationship, _currentYear: number): Relationship => {
  // Đảm bảo NPC luôn có ID duy nhất nếu chưa có
  const result = { ...npc };
  if (!result.id) {
    // Fallback nếu useGameLogic không gán ID theo số thứ tự
    result.id = `npc_fb_${Date.now()}`;
  }
  return result;
};

export const mergeNpcData = (oldNpc: Relationship, newNpc: Relationship, narratorText: string, _currentYear: number, _justification?: string): Relationship => {
  const result = { ...oldNpc };
  const changes: Record<string, { old: any, new: any }> = {};
  const newFields: string[] = oldNpc.newFields || [];

  // Trộn tất cả các trường từ AI gửi về
  Object.entries(newNpc).forEach(([key, value]) => {
    if (key === 'id' || key === 'lastChanges' || key === 'lockedFields' || key === 'newFields' || key === 'bodyDescription') return;
    
    const k = key as keyof Relationship;
    const oldVal = oldNpc[k];

    // Kiểm tra xem trường này có bị khóa không
    if (oldNpc.lockedFields?.includes(k)) {
      return;
    }
    
    if (value !== undefined && value !== null && value !== oldVal) {
      // Bảo vệ dữ liệu hợp lệ: Không cho phép ghi đè một giá trị hợp lệ bằng một placeholder (??, Chưa rõ, v.v.)
      if (isValidValue(oldVal) && !isValidValue(value)) {
        return;
      }

      // Check if it's a new valid value replacing a placeholder
      if (!isValidValue(oldVal) && isValidValue(value)) {
        if (!newFields.includes(k)) newFields.push(k);
      }

      // Ghi nhận thay đổi để hiển thị Diff trong UI
      if (typeof value !== 'object' || Array.isArray(value)) {
        changes[k] = { old: oldVal, new: value };
      }
      (result as any)[k] = value;
    }
  });

  // Trộn BodyDescription riêng biệt
  if (newNpc.bodyDescription) {
    const mergedBody = { ...(result.bodyDescription || {}) };
    Object.entries(newNpc.bodyDescription).forEach(([key, value]) => {
      const k = key as keyof BodyDescription;
      const oldVal = mergedBody[k];

      // Kiểm tra xem trường body này có bị khóa không
      if (oldNpc.lockedFields?.includes(`body_${k}`)) {
        return;
      }

      if (value !== undefined && value !== null && value !== oldVal) {
        // Bảo vệ dữ liệu hợp lệ của cơ thể
        if (isValidValue(oldVal) && !isValidValue(value)) {
          return;
        }

        if (!isValidValue(oldVal) && isValidValue(value)) {
          const fieldKey = `body_${k}`;
          if (!newFields.includes(fieldKey)) newFields.push(fieldKey);
        }
        changes[`body_${k}`] = { old: oldVal, new: value };
        (mergedBody as any)[k] = value;
      }
    });
    result.bodyDescription = mergedBody;
  }

  // Xác định sự hiện diện dựa trên văn bản dẫn truyện
  const narratorMentions = oldNpc.name ? narratorText.includes(oldNpc.name) : false;
  result.isPresent = newNpc.isPresent !== undefined ? newNpc.isPresent : narratorMentions;
  result.lastChanges = changes;
  result.newFields = newFields;

  return result;
};

function renderSafeText(data: any): string {
  if (!data) return "";
  if (typeof data === 'string') return data;
  return String(data);
}
