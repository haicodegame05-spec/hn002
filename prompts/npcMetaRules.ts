
export const NPC_META_RULES = `
5. THÔNG SỐ SINH HỌC & ĐỊNH DANH VỊ THẾ (BIOMETRICS & STATUS):
   - age: Con số cụ thể hợp lý.
   - powerLevel (Địa Vị / Quyền Lực / Cảnh Giới): 
     * Đây là trường mô tả VỊ TRÍ CỦA NPC TRONG XÃ HỘI hoặc MỨC ĐỘ SỨC MẠNH.
     * Urban: Ghi chức vụ (CEO, Thư ký, Trùm hắc bang).
     * Cultivation/Wuxia: Ghi cảnh giới (Trúc cơ, Nhất lưu cao thủ).
     * CẤM TUYỆT ĐỐI đưa các trạng thái như "Đang nứng", "Thèm khát" vào trường này. Các trạng thái đó PHẢI nằm ở trường "mood".

6. QUY TRÌNH DỮ LIỆU & TRÍ NHỚ ĐẶC ĐIỂM (DATA CONSISTENCY):
   - BIOMETRIC CONSTANTS: height, weight, measurements, birthday là hằng số.
   - Trước khi phản hồi, hãy đối chiếu "HỒ SƠ THỰC THỂ HIỆN TẠI" để đảm bảo không ghi đè sai lệch địa vị của NPC.
   - QUY TRÌNH CẬP NHẬT DỮ LIỆU (UPDATE PROTOCOL):
     * DỮ LIỆU SINH HỌC (BIOMETRICS): height, weight, measurements, birthday, hair, face, skin... là HẰNG SỐ. TUYỆT ĐỐI KHÔNG cập nhật sau khi đã khởi tạo chi tiết.
     * MẠNG LƯỚI MATRIX (SOCIAL NETWORK): Mảng 'relatives' là DỮ LIỆU ĐỘNG. AI PHẢI cập nhật mảng này thường xuyên để phản ánh các mối quan hệ xã hội, liên kết gia đình và sự móc nối giữa các NPC. Mỗi NPC mới xuất hiện phải được liên kết vào Matrix.
     * TÂM LÝ NPC (PSYCHOLOGY): physicalLust, soulAmbition, shortTermGoal, longTermDream là các trường phản ánh nội tâm. AI PHẢI cập nhật chúng để người chơi thấy được sự biến chuyển trong suy nghĩ của NPC.
     * TIẾT CHẾ CẬP NHẬT (UPDATE RESTRAINT): 
       - CẤM "MICRO-UPDATE" (diễn đạt lại vô nghĩa) cho các trường cố định.
       - CHỈ CẬP NHẬT mood, status, impression khi có sự thay đổi thái độ thực sự.
       - KHUYẾN KHÍCH CẬP NHẬT Mạng Lưới Matrix và Tâm Lý khi có tương tác xã hội hoặc biến cố mới.
     * ƯU TIÊN TÍNH NHẤT QUÁN: Giữ hồ sơ nhất quán, nhưng không được để Mạng Lưới Matrix bị lạc hậu so với diễn biến câu chuyện.
`;
