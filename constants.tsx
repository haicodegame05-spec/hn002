
import { GameArchetype } from './types';
import { URBAN_NORMAL_ARCHETYPE } from './constants/urbanNormal';
import { URBAN_SUPER_ARCHETYPE } from './constants/urbanSuper';
import { FANTASY_HUMAN_ARCHETYPE } from './constants/fantasyHuman';
import { FANTASY_MULTI_ARCHETYPE } from './constants/fantasyMulti';
import { CULTIVATION_ARCHETYPE } from './constants/cultivation';
import { WUXIA_ARCHETYPE } from './constants/wuxia';
import { SCI_FI_ARCHETYPE } from './constants/sciFi';
import { HISTORY_ARCHETYPE } from './constants/history';
import { WHOLESOME_ARCHETYPE } from './constants/wholesome';
import { MCU_ARCHETYPE } from './constants/mcu';
import { DCU_ARCHETYPE } from './constants/dcu';
import { SUPER_SENTAI_ARCHETYPE } from './constants/superSentai';
import { KAMEN_RIDER_ARCHETYPE } from './constants/kamenRider';

export const GAME_ARCHETYPES: GameArchetype[] = [
  URBAN_NORMAL_ARCHETYPE,
  URBAN_SUPER_ARCHETYPE,
  FANTASY_HUMAN_ARCHETYPE,
  FANTASY_MULTI_ARCHETYPE,
  CULTIVATION_ARCHETYPE,
  WUXIA_ARCHETYPE,
  SCI_FI_ARCHETYPE,
  HISTORY_ARCHETYPE,
  WHOLESOME_ARCHETYPE,
  MCU_ARCHETYPE,
  DCU_ARCHETYPE,
  SUPER_SENTAI_ARCHETYPE,
  KAMEN_RIDER_ARCHETYPE
];

export const DEFAULT_AVATAR = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
