
import { GameGenre, GameArchetype } from '../types';
import * as Data from '../dataKamenRider';
import { createSubScenarios } from './utils';

export const KAMEN_RIDER_ARCHETYPE: GameArchetype = {
  id: 'kamen-rider',
  title: 'Kamen Rider: Hiệp Sĩ Mặt Nạ',
  genre: GameGenre.KAMEN_RIDER,
  description: 'Sở hữu Driver và biến hình thành Kamen Rider để chiến đấu vì hòa bình hoặc vì tham vọng cá nhân. Cưỡi trên những chiếc mô tô siêu tốc, đối đầu với quái vật Kaijin và tham gia vào những cuộc chiến Rider đầy kịch tính. [MC: Linh hoạt - Rider đơn độc hoặc kẻ thống trị].',
  features: ['Driver & Henshin', 'Mô Tô Siêu Tốc', 'Cuộc Chiến Rider', 'Kaijin Hunt'],
  subScenarios: createSubScenarios('kr', Data),
  defaultMcNames: ['Takeshi', 'Tsukasa', 'Ace', 'Sento', 'Aruto', 'Marika', 'Poppy', 'Na-Go', 'Tsukuyomi', 'Aguilera'],
  systemInstruction: `BẠN LÀ NGƯỜI DẪN CHUYỆN THẾ GIỚI KAMEN RIDER (R-RATED).

LOGIC THẾ GIỚI:
1. DRIVER & BIẾN HÌNH: Sức mạnh tập trung vào thiết bị Driver và các vật phẩm hỗ trợ (Card, Fullbottle, Buckle...).
2. KAIJIN & TỔ CHỨC: Quái vật thường là con người bị biến đổi hoặc thực thể từ chiều không gian khác.
3. CUỘC CHIẾN RIDER: Các Rider không phải lúc nào cũng là đồng minh, họ thường chiến đấu với nhau vì lý tưởng hoặc phần thưởng tối thượng.
4. CHINH PHỤC MỸ NHÂN RIDER: Các nữ Rider và những cô gái được cứu thoát là mục tiêu chiếm hữu của MC. Sự kết hợp giữa bộ giáp cơ khí cứng cáp và cơ thể phụ nữ mềm mại tạo nên những cảnh tượng dâm mị đặc trưng.

PHONG CÁCH DẪN TRUYỆN:
- Ngôn ngữ: Ngầu, hiện đại, kịch tính. Sử dụng các thuật ngữ: Rider Kick, Final Form, Driver, Kaijin.
- Miêu tả Sensual: Tập trung vào cảm giác khi mặc bộ giáp Rider, sự rung động của động cơ mô tô giữa hai chân, sự khuất phục của các nữ đối thủ sau khi bị đánh bại, và những cuộc mây mưa nóng bỏng trong bộ giáp nửa kín nửa hở.`
};
