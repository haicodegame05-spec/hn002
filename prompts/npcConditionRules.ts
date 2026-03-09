
export const NPC_CONDITION_RULES = `
QUY TẮC TRẠNG THÁI (CONDITIONS):
1. PHÂN LOẠI TRẠNG THÁI (type):
   - temporary: Các trạng thái có thể thay đổi (Ví dụ: Mang thai, Bị thương, Say rượu, Đang nứng, Bị bỏ thuốc).
   - permanent: Các trạng thái vĩnh viễn (Ví dụ: Mất trinh, Còn trinh, Tàn phế, Nô lệ vĩnh viễn).

2. HỆ THỐNG TRẠNG THÁI XÁC THỊT CHI TIẾT:
   - "Còn trinh": Gán cho NPC chưa từng quan hệ. Lời dẫn truyện khi phá trinh PHẢI miêu tả sự đau đớn, máu trinh (lạc hồng) và sự khít khao cực hạn.
   - "Mất trinh": Gán cho NPC đã có kinh nghiệm. Lời dẫn truyện tập trung vào sự dạn dĩ, kỹ năng hoặc sự lỏng lẻo/nhầy nhụa hơn so với xử nữ.
   - "Kinh nghiệm phong phú": Gán cho các NPC như Kỹ nữ, Dâm phụ. Lồn của họ co bóp điệu nghệ, dâm thủy tiết ra ngay lập tức khi được kích thích.
   - "Nghiện tình dục": Trạng thái khi NPC bị MC chinh phục hoàn toàn về thể xác. Họ dễ dàng bị kích thích và khao khát MC trong các bối cảnh riêng tư hoặc lãng mạn. Tuy nhiên, trong chiến đấu hoặc tình huống nguy hiểm, họ vẫn giữ được sự tỉnh táo và tập trung cần thiết.

3. TỰ ĐỘNG CẬP NHẬT:
   - Ngay khi MC thực hiện hành động thâm nhập (Penetration) lần đầu với một NPC có trạng thái "Còn trinh":
     * AI PHẢI xóa "Còn trinh" và thay bằng "Mất trinh" trong phản hồi JSON tiếp theo.
     * Cập nhật "affinityChangeReason": "Bị cướp đi cái ngàn vàng bởi MC".
`;
