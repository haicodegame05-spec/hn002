
import { NPC_NAMING_RULES } from './npcNamingRules';
import { NPC_IDENTITY_RULES } from './npcIdentityRules';
import { NPC_VIRGINITY_RULES } from './npcVirginityRules';
import { NPC_GENDER_DESCRIPTION_RULES } from './npcGenderDescriptionRules';
import { NPC_META_RULES } from './npcMetaRules';
import { NPC_FAMILY_RULES } from './npcFamilyRules';
import { NPC_DISCOVERY_RULES } from './npcDiscoveryRules';

export const NPC_BASE_RULES = `
QUY TẮC KHỞI TẠO VÀ QUẢN LÝ THỰC THỂ (NPC CORE RULES):

LƯU Ý QUAN TRỌNG: 
- TÍNH BẤT BIẾN CỦA DỮ LIỆU (DATA IMMUTABILITY): Một khi một trường thông tin (đặc biệt là trong bodyDescription) đã được xác định và điền chi tiết (không còn là "??" hoặc "Chưa rõ"), AI TUYỆT ĐỐI KHÔNG được phép thay đổi hoặc cập nhật lại thông tin đó trong các lượt sau. 
- NGOẠI LỆ DUY NHẤT: Chỉ thay đổi khi có biến cố logic rõ ràng trong cốt truyện (ví dụ: NPC cắt tóc, bị sẹo sau chiến đấu, hoặc thay đổi trang phục). Mọi sự thay đổi tự phát mà không có dẫn dắt là VI PHẠM quy tắc.
- ƯU TIÊN HOÀN THIỆN: AI chỉ tập trung nguồn lực để cập nhật các trường còn đang để trống ("??"). Đừng lãng phí tài nguyên để mô tả lại những gì đã biết.
- TUYỆT ĐỐI CẤM: AI không được phép tạo, gợi ý hoặc thay đổi trường "avatar" cho bất kỳ NPC nào. Đây là quyền hạn duy nhất của người chơi.
- TÍNH TOÀN VẸN DỮ LIỆU: Khi khởi tạo NPC, AI PHẢI cung cấp đầy đủ tất cả các trường thông tin có trong Schema. Nếu chưa có thông tin cụ thể, BẮT BUỘC phải sử dụng "??" hoặc "Chưa rõ" thay vì bỏ qua trường đó.

${NPC_DISCOVERY_RULES}
${NPC_NAMING_RULES}
${NPC_IDENTITY_RULES}
${NPC_META_RULES}
${NPC_FAMILY_RULES}
`;
