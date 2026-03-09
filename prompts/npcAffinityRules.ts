
export const NPC_AFFINITY_RULES = `
QUY TẮC TOÁN HỌC THIỆN CẢM & TRUNG THÀNH (MANDATORY 1000-POINT SCALE LOGIC):

1. ĐỊNH NGHĨA GIÁ TRỊ (VALUE DEFINITION):
   - THANG ĐIỂM: 0 - 1000 (Không phải 100%).
   - CỘNG ĐIỂM (+): Khi hành động mang lại khoái cảm, thỏa mãn dục vọng, hoặc KÍCH THÍCH FETISH của NPC.
     * Hành động nhỏ: +5 đến +20 điểm.
     * Hành động ý nghĩa: +21 đến +50 điểm.
     * Sự kiện trọng đại/Cực khoái: +51 đến +150 điểm.
   - TRỪ ĐIỂM (-): Khi hành động gây nhàm chán, thất bại, hoặc đi ngược lại bản ngã sâu thẳm của NPC.
     * Sai lầm nhỏ: -10 đến -30 điểm.
     * Phản bội/Sỉ nhục: -50 đến -200 điểm.

2. MA TRẬN TỪ VỰNG THIỆN CẢM (AFFINITY VOCABULARY - SCALE 1000):
   - [0 - 100]: TỬ ĐỊCH / CĂM THÙ. NPC chỉ muốn MC chết.
   - [101 - 250]: ÁC CẢM / THÙ GHÉT. NPC luôn tìm cách gây khó dễ.
   - [251 - 400]: ĐỀ PHÒNG / LẠNH NHẠT. Tránh né MC, không tin tưởng.
   - [401 - 550]: XÃ GIAO / KHÁCH SÁO. Giữ khoảng cách, lịch sự tối thiểu.
   - [551 - 700]: THÂN THIẾT / TÌNH CẢM. Bắt đầu có thiện cảm và quan tâm.
   - [701 - 850]: ÁI MỘ / RUNG ĐỘNG. NPC đã nảy sinh tình cảm, khao khát được ở bên MC.
   - [851 - 950]: SI MÊ / TUYỆT ĐỐI. Lệ thuộc hoàn toàn về cảm xúc.
   - [951 - 1000]: LỆ THUỘC TRIỆT ĐỂ. MC là thần linh/lẽ sống duy nhất.

3. MA TRẬN TỪ VỰNG TRUNG THÀNH (LOYALTY VOCABULARY - SCALE 1000):
   - Áp dụng cho: Thành viên Harem, Thuộc hạ, Đệ tử, Cấp dưới.
   - [0 - 150]: PHẢN TRẮC. Sẵn sàng bán đứng MC bất cứ lúc nào.
   - [151 - 350]: BẤT PHỤC. Phục tùng hình thức nhưng tâm trí chống đối.
   - [351 - 550]: TẠM THỜI / LỢI ÍCH. Chỉ đi theo MC vì mục đích cá nhân.
   - [551 - 750]: TIN CẬY / ĐỒNG HÀNH. Đáng tin trong các công việc quan trọng.
   - [751 - 900]: TẬN HIẾN / TRUNG NGHĨA. Sẵn sàng hy sinh lợi ích cá nhân vì MC.
   - [901 - 1000]: TỬ SĨ / ĐỨC TIN. Tuyệt đối trung thành, không bao giờ phản bội.

4. LOGIC DỤC VỌNG ĐỘNG (DYNAMIC LUST & SATIATION - SCALE 1000):
   - Điểm "Lust" (Nhu Cầu Dục Vọng) đại diện cho HƯNG PHẤN TỨC THỜI (0-1000).
   - CƠ CHẾ THỎA MÃN (SATIATION): Sau khi NPC đạt cực khoái (Orgasm), Lust PHẢI GIẢM MẠNH (trừ 400 - 800 điểm).
   - CƠ CHẾ HỒI PHỤC (RECOVERY): Lust tăng lại theo thời gian hoặc kích thích.
   - CƠ CHẾ SUY GIẢM (DECAY): Tự động giảm dần về mức Libido nếu không có tương tác.

5. LOGIC TƯƠNG TÁC:
   - AI PHẢI miêu tả thái độ NPC khớp với nhãn cấp độ trên trong trường "text" và "affinityChangeReason".
   - Nếu "fetish" bị kích thích, hãy dùng các từ mạnh như "phát cuồng", "si mê tột độ".
`;
