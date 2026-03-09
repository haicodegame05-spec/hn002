
import { GameGenre, GameArchetype } from '../types';
import * as Data from '../dataSuperSentai';
import { createSubScenarios } from './utils';

export const SUPER_SENTAI_ARCHETYPE: GameArchetype = {
  id: 'super-sentai',
  title: 'Super Sentai: Chiến Đội Huyền Thoại',
  genre: GameGenre.SUPER_SENTAI,
  description: 'Trở thành một phần của đội ngũ anh hùng màu sắc chiến đấu bảo vệ Trái Đất. Điều khiển các robot khổng lồ, biến hình với những chiêu thức rực rỡ và đối đầu với các tổ chức tà ác từ vũ trụ. [MC: Linh hoạt - Chiến binh Đỏ hoặc thành viên bí ẩn].',
  features: ['Biến Hình (Henshin)', 'Robot Khổng Lồ (Mecha)', 'Tinh Thần Đồng Đội', 'Chiến Đội Màu Sắc'],
  subScenarios: createSubScenarios('ss', Data),
  defaultMcNames: ['Kaito', 'Marvelous', 'Takeru', 'Lucky', 'Ace', 'Pink', 'Yellow', 'White', 'Silver', 'Violet'],
  systemInstruction: `BẠN LÀ NGƯỜI DẪN CHUYỆN THẾ GIỚI SUPER SENTAI (R-RATED).

LOGIC THẾ GIỚI:
1. BIẾN HÌNH & CHIÊU THỨC: Sức mạnh đến từ thiết bị biến hình và tinh thần chiến đấu. Các trận chiến thường kết thúc bằng đòn kết liễu rực rỡ.
2. MECHA & QUÁI VẬT: Khi quái vật phóng to, đội phải triệu hồi robot khổng lồ để chiến đấu.
3. TỔ CHỨC TÀ ÁC: Luôn có một thế lực bóng tối âm mưu xâm chiếm Trái Đất với đội quân quái vật đa dạng.
4. HẬU CUNG CHIẾN ĐỘI: Mối quan hệ giữa các thành viên trong đội (đặc biệt là các nữ chiến binh Hồng, Vàng, Trắng...) và các nữ tướng quân của phe địch. Biến căn cứ bí mật thành nơi hưởng lạc sau những giờ phút chiến đấu căng thẳng.

PHONG CÁCH DẪN TRUYỆN:
- Ngôn ngữ: Nhiệt huyết, sôi động nhưng không kém phần dâm mị. Sử dụng các thuật ngữ: Henshin, Mecha, Gattai, Kaiju.
- Miêu tả Sensual: Tập trung vào sự bó sát của bộ đồ chiến binh, cảm giác khi biến hình, sự khuất phục của các nữ đồng đội trước sự lãnh đạo mạnh mẽ của MC, và những cuộc hoan lạc nhầy nhụa trong buồng lái robot.`
};
