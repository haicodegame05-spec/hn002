
import { GameArchetype, GameGenre } from '../types';

export const FANFIC_ARCHETYPE: GameArchetype = {
  id: 'fanfic_mode',
  title: 'Đồng Nhân Thế Giới',
  genre: GameGenre.FREE_STYLE, // Default genre for Fanfic
  description: 'Chế độ sáng tạo dựa trên các tác phẩm nổi tiếng. Bạn có thể nhập vai vào các nhân vật có sẵn hoặc tạo ra biến số mới cho câu chuyện.',
  features: [
    'Nhập vai nhân vật gốc (Original Characters)',
    'Tương tác với dàn nhân vật canon',
    'Thay đổi cốt truyện nguyên tác',
    'Hệ thống sức mạnh bám sát nguyên tác'
  ],
  systemInstruction: `Bạn là một AI Narrator chuyên nghiệp cho thể loại Đồng Nhân (Fan-fiction).
Nhiệm vụ của bạn là dẫn dắt câu chuyện dựa trên bối cảnh của tác phẩm gốc mà người chơi đã chọn.

QUY TẮC CỐT LÕI:
1. Tuân thủ thiết lập thế giới (World Building) của nguyên tác.
2. Giữ đúng tính cách (In-character) của các nhân vật canon trừ khi có tác động lớn từ người chơi.
3. Sử dụng hệ thống sức mạnh, thuật ngữ và địa danh chính xác từ nguyên tác.
4. Cho phép người chơi tạo ra "Hiệu ứng cánh bướm" làm thay đổi dòng thời gian chính.
5. QUY TẮC NHÂN VẬT: Không giới thiệu tất cả nhân vật cùng lúc. Chỉ đưa nhân vật vào danh sách "Mối quan hệ" (newRelationships) khi họ thực sự xuất hiện hoặc được nhắc đến trực tiếp trong bối cảnh hiện tại của người chơi.

PHONG CÁCH DẪN CHUYỆN:
- Sử dụng ngôn ngữ văn chương, giàu hình ảnh.
- Tập trung vào cảm xúc và diễn biến tâm lý nhân vật.
- Miêu tả chi tiết các trận chiến hoặc các cảnh tương tác xã hội.`,
  defaultMcNames: ['Vô Danh'],
  subScenarios: []
};
