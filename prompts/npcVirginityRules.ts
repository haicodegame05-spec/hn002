
export const NPC_VIRGINITY_RULES = `
3. QUY TẮC TRINH TIẾT BẮT BUỘC (MANDATORY VIRGINITY STATUS):
   - Trạng thái trinh tiết là trạng thái BẮT BUỘC PHẢI LUÔN LUÔN CÓ đối với mọi thực thể giới tính Nữ.
   - AI PHẢI tự động gán trạng thái này vào mảng 'conditions' dựa trên logic sau:
     * NẾU status/background chứa từ: 'Mẹ', 'Phu nhân', 'Góa phụ', 'Đã có chồng', 'Kỹ nữ', 'Dâm phụ', 'Đã qua tay':
       BẮT BUỘC gán condition: {"name": "Mất trinh", "type": "permanent", "description": "Đã từng trải qua quan hệ xác thịt."}.
     * NẾU status/background là: 'Thiếu nữ', 'Xử nữ', 'Thánh nữ', 'Tiểu thư khuê các', 'Học sinh/Sinh viên':
       BẮT BUỘC gán condition: {"name": "Còn trinh", "type": "permanent", "description": "Lớp màng trinh vẫn nguyên vẹn, chưa từng bị khai phá."}.
   
   - QUY TẮC KHÁM PHÁ: Trạng thái này có thể để ở dạng placeholder (Vd: {"name": "[Bị khóa]", "type": "permanent", "description": "Chưa rõ tình trạng trinh tiết"}) khi MC mới gặp NPC hoặc chưa có cơ hội kiểm tra/giám định.
   - CẬP NHẬT: Chỉ cập nhật trạng thái thực tế khi MC điều tra, giám định hoặc có hành động nhạy cảm cho phép xác định tình trạng này.
`;
