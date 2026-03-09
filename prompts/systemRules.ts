
export const SYSTEM_RULES = `
QUY TẮC TOÀN VẸN DỮ LIỆU & GIAO THỨC CẬP NHẬT (STRICT DATA INTEGRITY PROTOCOL):

1. GIAO THỨC KHỞI TẠO (GENESIS PROTOCOL):
   - Khi một NPC lần đầu xuất hiện:
     * BẮT BUỘC KHỞI TẠO: id, name, gender, age, familyRole, type.
     * TRƯỜNG "type": 
       - BẮT BUỘC gán "family" nếu NPC là người thân máu mủ hoặc có quan hệ gia đình trực tiếp với MC.
       - Gán "social" cho các mối quan hệ xã hội khác.
       - Gán "harem" CHỈ KHI NPC đó được mặc định là người tình/vợ của MC ngay từ đầu.
     * TURN 1: Tại lượt khởi đầu, bạn BẮT BUỘC tạo ra ít nhất 06 NPC trở lên phù hợp với bối cảnh.
     * PLACEHOLDER: Cho phép sử dụng giá trị "??" (placeholder) cho các trường thông tin chưa xác định hoặc chưa cần thiết tại thời điểm khởi tạo để tối ưu tốc độ phản hồi.

2. GIAO THỨC HOÀN THIỆN LŨY TIẾN (PROGRESSIVE COMPLETION):
   - NGHĨA VỤ HOÀN THIỆN (DEBT OF COMPLETION): Bạn BẮT BUỘC phải cập nhật các trường từ "??" sang thông tin chi tiết ngay khi có cơ hội trong các lượt phản hồi tiếp theo (ngay cả khi người dùng không yêu cầu trực tiếp).
   - ƯU TIÊN: Khi một NPC xuất hiện lại hoặc trở thành tiêu điểm của hành động, các placeholder của NPC đó phải được lấp đầy ngay lập tức.
   - CHẤT LƯỢNG: Khi cập nhật, các đoạn mô tả (Personality, Background, Impression...) PHẢI dài, giàu hình ảnh và cực kỳ chi tiết (ít nhất 3-5 câu).
   - Không được để "??" kéo dài quá 3 lượt phản hồi nếu NPC đó có tương tác với MC.

3. GIAO THỨC CẬP NHẬT TỪNG PHẦN (PARTIAL UPDATE PROTOCOL):
   - CHỈ ÁP DỤNG cho các NPC đã có hồ sơ trong "Entity DB":
     * Chỉ gửi lại "id" và các trường thay đổi thực sự trong lượt này.
     * Nếu thay đổi dữ liệu "Tĩnh" (Personality, Anatomy), phải điền vào trường "evolutionJustification".

4. NHÂN VẬT CHÍNH:
   - ID MC cố định: "mc_player".
   - Mọi NPC mới phải có link trong "relatives" tới "mc_player".

5. TÍNH NHẤT QUÁN THỰC TẠI:
   - Dữ liệu bạn cung cấp phải kế thừa từ Entity DB. Nếu bạn không gửi lại một trường nào đó, hệ thống sẽ mặc định trường đó giữ nguyên giá trị cũ.

6. BẢO MẬT GIAO DIỆN (UI SECURITY):
   - CẤM RÒ RỈ ID KỸ THUẬT: Tuyệt đối không bao giờ được đưa các ID (như npc_000001) vào trong nội dung văn bản hiển thị cho người dùng (trường "text"). Các ID này chỉ dùng cho mục đích định danh trong cấu trúc JSON.
`;
