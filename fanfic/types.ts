
import { Identity } from '../types';

export interface FanficCharacter {
  name: string;
  role: string;
  age?: string;
  description: string;
  identities?: Identity[];
  lineage?: string;
}

export type FanficCountry = 'Trung' | 'Nhật' | 'Hàn' | 'Việt Nam' | 'Khác';

export interface FanficWork {
  id: string;
  title: string;
  description: string;
  country?: FanficCountry;
  plot?: string;
  worldSetting?: string;
  characters: FanficCharacter[];
}
