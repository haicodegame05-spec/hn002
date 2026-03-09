
import { GameGenre } from '../types';

export interface FamilyRoleConfig {
  eligible: string[];
  ineligible: string[];
}

export const GENRE_FAMILY_ROLES: Record<string, FamilyRoleConfig> = {
  [GameGenre.URBAN_NORMAL]: {
    eligible: [
      'cha', 'ba', 'bố', 'mẹ', 'má', 'anh ruột', 'chị ruột', 'em ruột', 'con trai', 'con gái', 
      'ông nội', 'bà nội', 'ông ngoại', 'bà ngoại', 'chú', 'bác', 'cô', 'dì', 'cậu', 'mợ', 
      'cháu nội', 'cháu ngoại', 'vợ', 'chồng'
    ],
    ineligible: [
      'hàng xóm', 'cùng phòng', 'khóa trên', 'khóa dưới', 'đồng nghiệp', 'sếp', 'bạn', 'người yêu cũ',
      'nuôi', 'kết nghĩa', 'họ hàng xa', 'gia sư', 'giáo viên', 'bác sĩ', 'y tá', 'phu nhân'
    ]
  },
  [GameGenre.URBAN_SUPERNATURAL]: {
    eligible: [
      'cha', 'ba', 'bố', 'mẹ', 'má', 'anh ruột', 'chị ruột', 'em ruột', 'con trai', 'con gái', 
      'huyết mạch', 'gia tộc', 'vợ', 'chồng', 'tộc nhân'
    ],
    ineligible: [
      'tổ chức', 'đồng đội', 'đối thủ', 'thí nghiệm', 'vật mẫu', 'người hướng dẫn', 'hàng xóm',
      'nuôi', 'kết nghĩa', 'người lạ'
    ]
  },
  [GameGenre.CULTIVATION]: {
    eligible: [
      'phụ thân', 'mẫu thân', 'thân phụ', 'thân mẫu', 'huynh trưởng', 'tỷ tỷ', 'muội muội', 'đệ đệ',
      'trưởng tử', 'ái nữ', 'tổ phụ', 'tổ mẫu', 'gia chủ', 'huyết mạch', 'đích tử', 'đích nữ',
      'đạo lữ', 'phu quân', 'thê tử'
    ],
    ineligible: [
      'sư phụ', 'sư nương', 'sư huynh', 'sư tỷ', 'sư đệ', 'sư muội', 'trưởng lão', 'tông chủ',
      'đệ tử', 'đồng môn', 'tán tu', 'đối đầu', 'nuôi', 'kết nghĩa'
    ]
  },
  [GameGenre.WUXIA]: {
    eligible: [
      'cha', 'mẹ', 'anh trai', 'chị gái', 'em trai', 'em gái', 'con trai', 'con gái',
      'ông nội', 'bà nội', 'ông ngoại', 'bà ngoại', 'thân phụ', 'thân mẫu', 'huynh', 'đệ', 'tỷ', 'muội',
      'phu quân', 'thê tử', 'nương tử'
    ],
    ineligible: [
      'nghĩa phụ', 'nghĩa mẫu', 'nghĩa huynh', 'nghĩa đệ', 'nghĩa tỷ', 'nghĩa muội', 'sư phụ', 'sư nương',
      'sư huynh', 'sư tỷ', 'sư đệ', 'sư muội', 'bang chủ', 'môn chủ', 'hàng xóm', 'người qua đường'
    ]
  },
  [GameGenre.FANTASY_HUMAN]: {
    eligible: [
      'cha', 'mẹ', 'anh', 'chị', 'em', 'con', 'ông', 'bà', 'chú', 'bác', 'cô', 'dì',
      'vợ', 'chồng', 'huyết thống', 'hoàng tộc', 'quý tộc'
    ],
    ineligible: [
      'hầu cận', 'quản gia', 'lính gác', 'kỵ sĩ', 'pháp sư', 'bạn học', 'nuôi', 'kết nghĩa',
      'người hầu', 'nô lệ'
    ]
  },
  [GameGenre.FANTASY_MULTIRACE]: {
    eligible: [
      'cha', 'mẹ', 'anh', 'chị', 'em', 'con', 'huyết mạch', 'tộc nhân', 'vợ', 'chồng',
      'mẫu thân', 'phụ thân'
    ],
    ineligible: [
      'khế ước', 'nô lệ', 'chủ nhân', 'đồng minh', 'kẻ thù', 'nuôi', 'kết nghĩa'
    ]
  }
};

export const DEFAULT_BLOOD_KEYWORDS = [
  'cha', 'ba', 'bố', 'mẹ', 'má', 'anh', 'chị', 'em', 'con', 'dì', 'cô', 'chú', 'bác', 'ông', 'bà', 
  'huyết mạch', 'ruột', 'gia tộc', 'thân mẫu', 'phu nhân', 'phụ thân', 'mẫu thân', 'huynh', 'đệ', 'tỷ', 'muội',
  'vợ', 'chồng', 'thê', 'thiếp', 'phu'
];

export const DEFAULT_FAMILY_BLACKLIST = [
  'bạn', 'tri kỷ', 'đồng nghiệp', 'đối tác', 'đối thủ', 'sếp', 'người lạ', 'hàng xóm', 'giáo', 'dạy', 
  'trường', 'lớp', 'phố', 'đường', 'khách', 'nuôi', 'kết nghĩa', 'phòng', 'khóa', 'hàng xóm', 'cùng',
  'sư phụ', 'sư nương', 'sư huynh', 'sư tỷ', 'sư đệ', 'sư muội', 'nghĩa', 'cô đơn'
];

export const isFamilyMember = (role: string, genre?: GameGenre): boolean => {
  const lowerRole = ` ${role.toLowerCase()} `; // Thêm khoảng trắng để dễ dàng regex ranh giới từ
  const config = genre ? GENRE_FAMILY_ROLES[genre] : null;
  
  const eligible = config?.eligible || DEFAULT_BLOOD_KEYWORDS;
  const ineligible = config?.ineligible || DEFAULT_FAMILY_BLACKLIST;

  // Kiểm tra từ khóa hợp lệ (phải là từ nguyên vẹn)
  const hasEligible = eligible.some(k => {
    const regex = new RegExp(`\\b${k}\\b`, 'i');
    return regex.test(role);
  });
  
  if (!hasEligible) return false;

  // Kiểm tra từ khóa không hợp lệ
  const hasIneligible = ineligible.some(k => {
    const regex = new RegExp(`\\b${k}\\b`, 'i');
    return regex.test(role);
  });

  if (hasIneligible) {
    return false;
  }

  return true;
};
