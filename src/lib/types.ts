export type DiceType = 1 | 2 | 3 | 4; // 1:d4, 2:d6, 3:d8, 4:d12

export interface CharacterCard {
  id: string;
  name: string;
  baseHp: number;
  attackLevel: number;
  defenseLevel: number;
  initialDice: [number, number, number]; // [lvl1, lvl2, lvl3]
  description: string;
}

export type StatusEffect = 'poison' | 'toughness' | 'strength' | 'hack' | 'counter' | 'pierce' | 'combo';

export interface PlayerState {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  baseAttackLevel: number;
  baseDefenseLevel: number;
  attackLevel: number;
  defenseLevel: number;
  dice: DiceType[];
  characterId: string | null;
  statuses: Record<StatusEffect, number>;
  // Transient state per round
  rerolls: number;
  rolledDice: { type: DiceType; value: number; id: string }[];
  selectedDiceIds: string[];
  // Character specific state
  xilianAccumulation: number;
  xilianTriggered: boolean;
  danhengCounterActive: boolean;
}

export type GamePhase = 
  | 'LOBBY'
  | 'CHAR_SELECT'
  | 'ROUND_START'
  | 'ATTACK_ROLL'
  | 'ATTACK_SELECT'
  | 'DEFEND_ROLL'
  | 'DEFEND_SELECT'
  | 'RESOLUTION'
  | 'GAME_OVER';

export interface GameLog {
  id: string;
  message: string;
  timestamp: number;
  type?: 'info' | 'attack' | 'defend' | 'damage' | 'effect' | 'skill';
}

export interface GameState {
  phase: GamePhase;
  players: Record<string, PlayerState>;
  hostId: string;
  guestId: string | null;
  attackerId: string | null;
  defenderId: string | null;
  turnNumber: number;
  logs: GameLog[];
  roomId: string;
  charSelectChoices: Record<string, string[]>; // player Id -> character ids
  combatResult?: {
    atkValue: number;
    defValue: number;
    pierce: boolean;
    combo: boolean;
  } | null;
}

export const DICE_SIDES: Record<DiceType, number> = {
  1: 4,
  2: 6,
  3: 8,
  4: 12,
};
