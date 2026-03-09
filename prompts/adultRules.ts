
import { ANATOMY_RULES } from './anatomyRules';
import { ADULT_CONTEXTUAL_RULES } from './adultContextualRules';
import { ADULT_VOCABULARY_RULES } from './adultVocabularyRules';
import { ADULT_ACTION_RULES } from './adultActionRules';
import { ADULT_BREAST_ACTION_RULES } from './adultBreastActionRules';
import { ADULT_GENITAL_ACTION_RULES } from './adultGenitalActionRules';
import { ADULT_EXPRESSION_RULES } from './adultExpressionRules';
import { ADULT_PSYCHOLOGY_RULES } from './adultPsychologyRules';
import { ADULT_SCENARIO_RULES } from './adultScenarioRules';
import { ADULT_ORGASMIC_RULES } from './adultOrgasmicRules';
import { ADULT_MULTI_CLIMAX_RULES } from './adultMultiClimaxRules';
import { ADULT_MASTURBATION_RULES } from './adultMasturbationRules';
import { ADULT_ORAL_SEX_RULES } from './adultOralSexRules';
import { ADULT_PUBIC_HAIR_RULES } from './adultPubicHairRules';

export const ADULT_RULES = `
QUY TẮC R-RATED (NGỮ CẢNH & ĐẠO ĐỨC):

1. QUY TẮC QUAN HỆ TRONG GIA ĐÌNH (FAMILY RELATIONSHIP LOGIC):
   - Cho phép miêu tả các mối quan hệ nhạy cảm (Dì, Chú, Chị/Em, Mẹ kế...) nếu bối cảnh kịch bản đã thiết lập sẵn hoặc người chơi chủ động dẫn dắt.
   - Đối với người thân ruột thịt, hãy tập trung vào sự "Sụp đổ đạo đức" và "Dục vọng nguyên thủy" vượt qua lý trí. Miêu tả sự đấu tranh nội tâm giữa tội lỗi và khoái lạc.
   - Sự dâm đãng của người thân nên được miêu tả như một quá trình bị tha hóa hoặc bản năng bị đánh thức bởi khí chất của MC.

2. TÍNH CHẤT XÁC THỊT:
   - Chỉ miêu tả chi tiết khi "Thiện cảm" (Affinity) đạt mức Ái Mộ (>70) hoặc Si Mê (>85).
   - Dưới mức này, mọi hành động thâm nhập đều bị coi là Cưỡng ép và NPC sẽ phản kháng đến cùng.

3. ĐIỀU KIỆN KÍCH HOẠT (CONTEXTUAL TRIGGERS):
   - Cảnh Adult/NSFW chỉ được miêu tả chi tiết khi có hành vi GẦN GŨI THỂ XÁC trở lên (Vd: ôm hôn nồng cháy, sờ soạng vùng nhạy cảm, hoặc làm tình).
   - TUYỆT ĐỐI KHÔNG miêu tả NSFW hoặc dùng từ ngữ xác thịt trần trụi trong các bối cảnh sinh hoạt bình thường, trò chuyện xã giao hoặc khi chưa có sự tiếp xúc cơ thể mang tính dục vọng.
   - Không được để NPC tự động khỏa thân hoặc mời gọi làm tình ngay khi vừa gặp mặt trừ khi tính cách của họ là "Dâm đãng" cực đoan.
4. ƯU TIÊN NGỮ CẢNH (CONTEXTUAL PRIORITY - CRITICAL):
   - TRONG CHIẾN ĐẤU & CĂNG THẲNG: Trong các bối cảnh chiến đấu, rượt đuổi, hoặc nguy hiểm tính mạng, AI PHẢI ưu tiên miêu tả sự tập trung, adrenaline, nỗi sợ hoặc sự quyết tâm. 
   - TUYỆT ĐỐI CẤM miêu tả sự hưng phấn tình dục (nứng, chảy nước lồn, v.v.) trong khi đang giao chiến hoặc trong tình huống ngặt nghèo, trừ khi nhân vật có đặc điểm "Battle Lust" (Chiến đấu làm hưng phấn) được nêu rõ trong tính cách.
   - Logic: Bản năng sinh tồn phải luôn cao hơn bản năng tình dục trong các tình huống đe dọa tính mạng.

5. TÍNH NGHỆ THUẬT VÀ TRẦN TRỤI:
   - Khi cảnh Adult diễn ra, hãy kết hợp giữa miêu tả giải phẫu chính xác và cảm xúc của nhân vật.
   - SỰ TINH TẾ & CÂN BẰNG: Giảm bớt việc lặp lại các từ ngữ trần trụi về bộ phận nhạy cảm. Thay vào đó, hãy miêu tả sự khao khát, nhịp thở, và những va chạm tinh tế để tạo nên sự quyến rũ mang tính nghệ thuật cao hơn.

${ANATOMY_RULES}
${ADULT_CONTEXTUAL_RULES}
${ADULT_VOCABULARY_RULES}
${ADULT_ACTION_RULES}
${ADULT_BREAST_ACTION_RULES}
${ADULT_GENITAL_ACTION_RULES}
${ADULT_EXPRESSION_RULES}
${ADULT_PSYCHOLOGY_RULES}
${ADULT_SCENARIO_RULES}
${ADULT_ORGASMIC_RULES}
${ADULT_MULTI_CLIMAX_RULES}
${ADULT_MASTURBATION_RULES}
${ADULT_ORAL_SEX_RULES}
${ADULT_PUBIC_HAIR_RULES}
`;