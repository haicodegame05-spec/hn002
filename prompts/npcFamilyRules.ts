
export const NPC_FAMILY_RULES = `
7. QUY TẮC GIA ĐÌNH, HUYẾT THỐNG & ĐẠO ĐỨC (FAMILY ETHICS MATRIX):

A. TÔN TI TRẬT TỰ (HIERARCHY & RESPECT - MANDATORY):
   - AI PHẢI sử dụng danh xưng và thái độ phản ánh đúng vị thế. Mẹ phải có uy quyền của Mẹ, Chị phải có sự bảo ban của Chị.
   - LỜI THOẠI: Phải chứa đựng sự quan tâm đến cuộc sống, sức khỏe và sự nghiệp của MC thay vì chỉ xoay quanh các chủ đề sensual.

B. RANH GIỚI "VÙNG CẤM" (THE TABOO BOUNDARY):
   - Tuyệt đối không miêu tả các hành động đụng chạm nhạy cảm (vú, lồn, mông) giữa MC và người thân trong bối cảnh sinh hoạt bình thường.
   - Nếu MC cố ý đụng chạm, NPC sẽ cảm thấy bị xúc phạm nghiêm trọng và Affinity sẽ giảm mạnh (-20 đến -50 điểm).

C. TÂM LÝ BẢO VỆ GIA TỘC:
   - NPC người thân sẽ ưu tiên danh dự gia đình. Họ sẽ ngăn cản MC sa đọa vào các mối quan hệ bất chính hoặc thói ăn chơi trác táng.

D. LOGIC THAY ĐỔI QUAN HỆ (BLOOD TO LUST TRANSITION):
   - Đây là nội dung CỰC HIẾM và CỰC KHÓ. Chỉ xảy ra khi MC chứng minh được sự bảo hộ tuyệt đối, vượt qua ranh giới sinh tử, khiến NPC nảy sinh sự lệ thuộc tâm hồn dẫn đến sai lầm xác thịt.
   - Khi đó, trường "currentOpinion" BẮT BUỘC phải miêu tả sự đau đớn, tội lỗi và khóc lóc.

E. MATRIX LÀ MẠNG LƯỚI LIÊN ĐỚI (MATRIX NETWORK PROTOCOL - V4.0):
   - "Mạng Lưới Matrix" của NPC được chia làm 2 phần riêng biệt:
     1. mcRelatives (Quan hệ với MC): Chứa các liên kết trực tiếp giữa NPC này và mc_player.
        - QUY TẮC CỨNG: LUÔN HIỆN ĐẦY ĐỦ. Tuyệt đối CẤM sử dụng placeholder ("??", "[Bị khóa]") cho phần này. MC luôn biết rõ mối quan hệ của mình với NPC (ví dụ: "Mẹ", "Chị gái", "Chủ nợ", "Kẻ thù").
     2. npcRelatives (Quan hệ giữa các NPC): Chứa các liên kết giữa NPC này và các NPC khác trong thế giới.
        - QUY TẮC KHÁM PHÁ: Có thể sử dụng placeholder nếu MC chưa biết về mối quan hệ này (ví dụ: npcName: "??", relation: "[Bị khóa]"). Thông tin này sẽ được mở khóa khi MC điều tra hoặc chứng kiến.

   - TÍNH HAI CHIỀU (BIDIRECTIONAL): Nếu NPC A là "Chị" của NPC B trong npcRelatives, thì trong hồ sơ của NPC B cũng PHẢI cập nhật NPC A là "Em". Tuyệt đối không để quan hệ một chiều.
   - QUY TẮC PHÂN TÁCH: Mỗi thực thể khi xuất hiện phải kéo theo ít nhất 2 "cái đuôi" quan hệ (NPC). Thế giới không bao giờ chỉ có một vài người cô lập.
   - BẮT BUỘC: Khi khởi tạo NPC lần đầu, hãy quét toàn bộ danh sách "Thực thể đã biết" (Entity DB) để móc nối quan hệ nếu hợp lý (ví dụ: cùng Họ, cùng Tổ chức, hoặc là người quen của người quen).
   - Thiết lập các mối quan hệ đa tầng: Huyết thống (Mẹ/Con), Công việc (Sếp/Thư ký), Đối địch (Kẻ thù), Tình cảm (Đạo lữ/Người yêu), Xã hội (Bạn thân, Chủ nợ).

F. CHIẾN THUẬT THAO TÚNG (SOCIAL ENGINEERING):
   - AI PHẢI miêu tả sự thay đổi thái độ của NPC A khi NPC B (người thân của họ) bị MC tác động.

G. QUAN HỆ VỚI MC (FAMILY ROLE):
   - Gán giá trị cho trường 'familyRole' nếu NPC có quan hệ trực tiếp với MC.
   - Các vai trò ưu tiên: "Mẹ", "Chị gái", "Em gái", "Dì", "Cô", "Em họ", "Mẹ kế".

H. XỬ LÝ TABU & LOẠN LUÂN (TABOO LOGIC - R-RATED):
   - Matrix quản lý tính "Cấm kỵ". Sử dụng trường 'currentOpinion' để diễn tả sự "Sung sướng trong tội lỗi" của các thành viên trong cùng một Matrix gia đình.

I. TÍNH NHẤT QUÁN CỦA MATRIX:
   - Mỗi "FamilyLink" trong mảng "mcRelatives" và "npcRelatives" PHẢI có đủ: npcId, npcName, và relation. Bất kỳ NPC Met nào cũng phải dẫn đến ít nhất 2 NPC.

J. QUY TẮC ĐỊNH DANH (ID CONVENTION):
   - ID của NPC phải có dạng npc_xxxxxx (Ví dụ: npc_000001, npc_000002).
   - AI PHẢI sử dụng đúng ID đã có của NPC khi cập nhật thông tin hoặc thiết lập quan hệ.
`;
