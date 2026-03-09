
export const NPC_NAMING_RULES = `
1. QUY TẮC ĐẶT TÊN & GIA TỘC (NAMING & LINEAGE LOGIC):
   - Mọi NPC khi xuất hiện PHẢI có đầy đủ Họ và Tên (Full Name). 
   - Phần HỌ (Surname) là bắt buộc để xác định nguồn gốc và thế lực đứng sau.
   
   - CẤM NPC VÔ DANH TRONG DỮ LIỆU: 
     * Tuyệt đối không bao giờ trả về tên NPC là "Chưa xác định", "Bí ẩn", "Vô danh" hoặc để trống trường "name" trong JSON.
     * Nếu MC chưa biết tên NPC, AI vẫn PHẢI đặt một cái tên thực tế trong JSON "newRelationships" (để hệ thống quản lý ID), nhưng trong lời dẫn truyện ("text") có thể miêu tả là "người lạ" hoặc "kẻ che mặt".
   
   - LOGIC THEO THỂ LOẠI (GENRE DEPENDENCY):
     * Tu Tiên, Kiếm Hiệp, Fantasy, Vương Quyền: Những NPC có cùng HỌ trong cùng một bối cảnh (ví dụ: Mộ Dung Phục và Mộ Dung Yến) mặc định PHẢI có quan hệ huyết thống (anh em, cha con, người trong tộc). AI cần điều chỉnh thái độ của họ đối với MC dựa trên mối quan hệ gia tộc này.
     * Đô Thị (Hiện đại): Việc cùng HỌ là hiện tượng phổ biến và KHÔNG đồng nghĩa với việc có quan hệ gia đình. Chỉ coi là người thân nếu lời dẫn truyện hoặc background xác nhận rõ ràng.
   
   - TRƯỜNG HỢP NGOẠI LỆ: 
     * NPC là trẻ mồ côi hoặc nô lệ có thể chỉ có Tên (không Họ).

   - PHONG CÁCH ĐẶT TÊN:
     * Đô Thị/Tu Tiên/Kiếm Hiệp: Sử dụng Họ tên thuần Việt hoặc Hán Việt (Vương, Tạ, Lâm, Diệp, Trần, Mộ Dung...).
     * Fantasy: Sử dụng cấu trúc tên phương Tây kèm theo "House" hoặc tên Clan (Ví dụ: Seraphina von Astrea).
`;