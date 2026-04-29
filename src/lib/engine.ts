import { GameState, PlayerState, GamePhase, GameLog, DiceType, DICE_SIDES } from './types';
import { CHARACTERS } from './cards';

const generateId = () => Math.random().toString(36).substr(2, 9);
export const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const createInitialPlayer = (id: string, name: string): PlayerState => ({
  id,
  name,
  hp: 0,
  maxHp: 0,
  baseAttackLevel: 0,
  baseDefenseLevel: 0,
  attackLevel: 0,
  defenseLevel: 0,
  dice: [],
  characterId: null,
  statuses: {
    poison: 0,
    toughness: 0,
    strength: 0,
    hack: 0,
    counter: 0,
    pierce: 0,
    combo: 0
  },
  rerolls: 0,
  rolledDice: [],
  selectedDiceIds: [],
  xilianAccumulation: 0,
  xilianTriggered: false,
  danhengCounterActive: false
});

export const createInitialState = (hostId: string, hostName: string, roomId: string): GameState => {
  return {
    phase: 'LOBBY',
    players: {
      [hostId]: createInitialPlayer(hostId, hostName)
    },
    hostId,
    guestId: null,
    attackerId: null,
    defenderId: null,
    turnNumber: 0,
    logs: [{ id: generateId(), message: '等待另一名玩家加入...', timestamp: Date.now(), type: 'info' }],
    roomId,
    charSelectChoices: {}
  };
};

export const rollDice = (diceTypes: DiceType[]) => {
  return diceTypes.map(type => ({
    id: generateId(),
    type,
    value: randomInt(1, DICE_SIDES[type])
  }));
};

export const appendLog = (state: GameState, message: string, type: GameLog['type'] = 'info') => {
  state.logs.unshift({ id: generateId(), message, timestamp: Date.now(), type });
};

export type GameAction = 
  | { type: 'JOIN_GAME'; payload: { id: string; name: string } }
  | { type: 'START_GAME' }
  | { type: 'SELECT_CHARACTER'; payload: { playerId: string; characterId: string } }
  | { type: 'TOGGLE_DICE'; payload: { playerId: string; diceId: string } }
  | { type: 'REROLL'; payload: { playerId: string } }
  | { type: 'CONFIRM_DICE'; payload: { playerId: string } }
  | { type: 'NEXT_ROUND' };

// Internal game logic helpers
const endGame = (state: GameState, winnerId: string) => {
  state.phase = 'GAME_OVER';
  appendLog(state, `游戏结束！${state.players[winnerId].name} 获得了胜利！`, 'skill');
};

const startRound = (state: GameState) => {
  state.phase = 'ROUND_START';
  state.turnNumber++;
  
  // Decide attacker
  if (state.turnNumber === 1) {
    state.attackerId = Math.random() > 0.5 ? state.hostId : state.guestId;
    state.defenderId = state.attackerId === state.hostId ? state.guestId : state.hostId;
    appendLog(state, `系统随机决定 ${state.players[state.attackerId!].name} 率先攻击`);
  } else {
    // Swap roles
    const nextAttackerId = state.defenderId;
    state.defenderId = state.attackerId;
    state.attackerId = nextAttackerId;
  }
  
  const attacker = state.players[state.attackerId!];
  const defender = state.players[state.defenderId!];
  
  // Clear previous round's combat result
  state.combatResult = null;
  
  // Trigger Poison
  if (attacker.statuses.poison > 0) {
    const pDmg = attacker.statuses.poison;
    attacker.hp = Math.max(0, attacker.hp - pDmg);
    appendLog(state, `${attacker.name} 受到 ${pDmg} 点【中毒】伤害`);
  }
  
  if (attacker.hp <= 0) {
    endGame(state, defender.id);
    return;
  }
  
  // Init roll resources
  attacker.rerolls = 2;
  defender.rerolls = 0;
  
  // Start attack roll phase
  state.phase = 'ATTACK_ROLL';
  attacker.rolledDice = rollDice(attacker.dice);
  attacker.selectedDiceIds = [];
  appendLog(state, `回合 ${state.turnNumber}：${attacker.name} 开始攻击！`);
};

const applyDamage = (state: GameState, targetId: string, amount: number, isInstant: boolean) => {
  const target = state.players[targetId];
  target.hp -= amount;
  if (target.hp > target.maxHp) target.hp = target.maxHp;
  if (target.hp < 0) target.hp = 0;
  
  if (amount > 0) {
    appendLog(state, `${target.name} 受到 ${amount} 点${isInstant ? '【瞬伤】' : '伤害'}`);
  }
};

const countOccurrences = (arr: number[]) => {
  const counts: Record<number, number> = {};
  arr.forEach(num => { counts[num] = (counts[num] || 0) + 1; });
  return counts;
};

const getPairs = (counts: Record<number, number>) => Object.values(counts).filter(v => v >= 2).length;

const resolveCombat = (state: GameState) => {
  state.phase = 'RESOLUTION';
  const attacker = state.players[state.attackerId!];
  const defender = state.players[state.defenderId!];
  
  // Get selected dice arrays
  const atkDice = attacker.rolledDice.filter(d => attacker.selectedDiceIds.includes(d.id));
  let defDice = defender.rolledDice.filter(d => defender.selectedDiceIds.includes(d.id));
  
  let atkValues = atkDice.map(d => d.value);
  let defValues = defDice.map(d => d.value);

  // 1. Check Pre-combat Hacker Effects
  let atkHasHack = false;
  let defHasHack = false;
  
  if (attacker.characterId === 'huohua') {
    const atkCounts = countOccurrences(atkValues);
    if (Object.values(atkCounts).some(v => v > 1)) atkHasHack = true;
  }
  if (defender.characterId === 'huohua') {
    const defCounts = countOccurrences(defValues);
    if (Object.values(defCounts).some(v => v > 1)) defHasHack = true;
  }
  if (attacker.statuses.hack > 0) atkHasHack = true;
  if (defender.statuses.hack > 0) defHasHack = true;

  if (atkHasHack && defValues.length > 0) {
    const maxDefIndex = defValues.indexOf(Math.max(...defValues));
    defValues[maxDefIndex] = 1;
    appendLog(state, `${attacker.name} 触发了【骇入】，将防守方最大骰子转为1`, 'effect');
  }
  if (defHasHack && atkValues.length > 0) {
    const maxAtkIndex = atkValues.indexOf(Math.max(...atkValues));
    atkValues[maxAtkIndex] = 1;
    appendLog(state, `${defender.name} 触发了【骇入】，将攻击方最大骰子转为1`, 'effect');
  }

  // Calculate Base values
  let atkValue = atkValues.reduce((a, b) => a + b, 0);
  let defValue = defValues.reduce((a, b) => a + b, 0);

  // 2. Attacker character specific pre-combat
  let pierce = false;
  let combo = false;

  if (attacker.characterId === 'huangquan' && atkValues.length > 0 && atkValues.every(v => v === 4)) {
    pierce = true;
    attacker.attackLevel += 1;
    appendLog(state, `${attacker.name} 触发黄泉效果，获得【洞穿】并使攻击等级+1`, 'skill');
  }

  if (attacker.characterId === 'liuying') {
    const pairs = getPairs(countOccurrences(atkValues));
    if (pairs >= 2) {
      combo = true;
      appendLog(state, `${attacker.name} 触发流萤效果，获得【连击】`, 'skill');
    }
    if (attacker.hp === attacker.maxHp) {
      atkValue += 5;
      appendLog(state, `${attacker.name} 处于满血，基础攻击值+5`, 'effect');
    }
  }

  if (attacker.characterId === 'zhirenniao' && atkValues.length > 0 && atkValues.every(v => v % 2 === 0)) {
    atkDice.forEach(d => {
      const diceIdxInPlayer = attacker.dice.indexOf(d.type);
      if (diceIdxInPlayer !== -1 && attacker.dice[diceIdxInPlayer] < 4) {
        attacker.dice[diceIdxInPlayer] = (d.type + 1) as DiceType;
      }
    });
    appendLog(state, `${attacker.name} 触发知更鸟效果，升级了使用的骰子`, 'skill');
  }

  if (attacker.characterId === 'kafuka') {
    const uniqueValues = new Set(atkValues).size;
    defender.statuses.poison += uniqueValues;
    appendLog(state, `${attacker.name} 触发卡芙卡效果，为对方添加了 ${uniqueValues} 层【中毒】`, 'skill');
  }

  if (attacker.characterId === 'shajin') {
    const oddsCount = atkValues.filter(v => v % 2 !== 0).length;
    if (oddsCount > 0) {
      attacker.statuses.toughness += oddsCount;
      appendLog(state, `${attacker.name} 触发砂金效果，获得 ${oddsCount} 层【韧性】`, 'skill');
    }
    if (attacker.statuses.toughness >= 7) {
      attacker.statuses.toughness -= 7;
      applyDamage(state, defender.id, 7, true);
    }
  }

  if (attacker.characterId === 'sanyueqi') {
    const pairs = getPairs(countOccurrences(atkValues));
    if (pairs > 0) {
      applyDamage(state, defender.id, 3 * pairs, true);
    }
  }

  // 3. Defender character specific pre-combat
  if (defender.characterId === 'sanyueqi') {
    const pairs = getPairs(countOccurrences(defValues));
    if (pairs > 0) {
      applyDamage(state, attacker.id, 3 * pairs, true);
    }
  }

  // Apply Strength & Toughness
  if (attacker.statuses.strength > 0) {
    atkValue += attacker.statuses.strength;
  }
  if (defender.statuses.toughness > 0) {
    defValue += defender.statuses.toughness;
  }

  appendLog(state, `最终计算：攻击值 ${atkValue}，防御值 ${defValue}`);

  // Base Damage
  const calculateDamage = () => {
    if (pierce) return atkValue;
    return Math.max(atkValue - defValue, 0);
  };

  const dealDamageSequence = () => {
    let dmg = calculateDamage();
    applyDamage(state, defender.id, dmg, false);
    
    // Defender React
    if (defender.characterId === 'xiadie' && dmg > 0) {
      if (dmg > 8) {
        defender.attackLevel += 1;
        defender.defenseLevel += 1;
        appendLog(state, `${defender.name} 触发瑕蝶效果，攻击和防御等级+1`, 'skill');
      }
      if (dmg <= 5) {
        applyDamage(state, attacker.id, 3, true);
      }
    }
    if (defender.characterId === 'kafuka' && dmg >= 1) {
      if (attacker.statuses.poison > 0) {
        attacker.statuses.poison -= 1;
        appendLog(state, `${defender.name} 触发卡芙卡效果，移除对方1层【中毒】`, 'skill');
      }
    }
  };

  dealDamageSequence();
  if (combo && defender.hp > 0) {
    appendLog(state, `触发【连击】附加伤害！`, 'effect');
    dealDamageSequence();
  }

  // 4. Post-combat Attacker
  if (attacker.characterId === 'danheng' && atkValue >= 18) {
    attacker.danhengCounterActive = true;
    attacker.defenseLevel += 3;
    appendLog(state, `${attacker.name} 触发腾荒效果，下次防御等级+3并获得【反击】`, 'skill');
  }
  
  if (attacker.characterId === 'fengjin') {
    if (atkValues.length > 0 && atkValues.every(v => v === 6)) {
      attacker.statuses.strength = atkValue;
      attacker.hp = Math.min(attacker.maxHp, attacker.hp + 6);
      appendLog(state, `${attacker.name} 触发风堇效果，记录力量 ${atkValue} 并回复生命`, 'skill');
    } else {
      attacker.statuses.strength = Math.floor(atkValue * 0.5);
      appendLog(state, `${attacker.name} 触发风堇效果，获得力量 ${attacker.statuses.strength} 层`, 'skill');
    }
  }

  // 5. Post-combat Defender
  if (defender.danhengCounterActive) {
    defender.danhengCounterActive = false;
    defender.defenseLevel = defender.baseDefenseLevel; // restore
    const counterDmg = Math.max(defValue - atkValue, 0);
    if (counterDmg > 0) {
      appendLog(state, `${defender.name} 触发【反击】`);
      applyDamage(state, attacker.id, counterDmg, false);
    }
  }

  // 6. End of turn Xilian
  [attacker, defender].forEach(p => {
    if (p.characterId === 'xilian' && !p.xilianTriggered) {
      const val = p.id === attacker.id ? atkValue : defValue;
      p.xilianAccumulation += val;
      if (p.xilianAccumulation >= 24) {
        p.xilianTriggered = true;
        p.attackLevel += 2;
        p.statuses.hack = 999; // basically permanent hack
        appendLog(state, `${p.name} 触发昔涟效果，攻击等级+2并永久获得【骇入】`, 'skill');
      }
    }
  });

  // Store combat result for UI
  state.combatResult = {
    atkValue,
    defValue,
    pierce,
    combo
  };

  // End conditions
  if (attacker.hp <= 0 && defender.hp <= 0) {
    endGame(state, state.hostId); // Tie goes to host for simplicity, or we can handle it
  } else if (attacker.hp <= 0) {
    endGame(state, defender.id);
  } else if (defender.hp <= 0) {
    endGame(state, attacker.id);
  } else {
    // End of round. Wait for host to trigger NEXT_ROUND
    // We just leave it in RESOLUTION phase.
  }
};

export const processAction = (prevState: GameState, action: GameAction): GameState => {
  const state: GameState = JSON.parse(JSON.stringify(prevState));

  switch (action.type) {
    case 'JOIN_GAME': {
      if (state.phase !== 'LOBBY' || state.guestId) return state;
      state.guestId = action.payload.id;
      state.players[state.guestId] = createInitialPlayer(state.guestId, action.payload.name);
      appendLog(state, `玩家 ${action.payload.name} 加入了房间。`);
      
      // Select 3 random chars for each player
      state.phase = 'CHAR_SELECT';
      const availableChars = [...CHARACTERS].sort(() => 0.5 - Math.random());
      state.charSelectChoices[state.hostId] = availableChars.splice(0, 3).map(c => c.id);
      state.charSelectChoices[state.guestId] = availableChars.splice(0, 3).map(c => c.id);
      
      appendLog(state, `游戏开始！请选择你们的角色。`);
      break;
    }
    case 'START_GAME': {
      if (state.phase !== 'LOBBY' || !state.guestId) return state;
      state.phase = 'CHAR_SELECT';
      
      // Select 3 random chars for each player
      const availableChars = [...CHARACTERS].sort(() => 0.5 - Math.random());
      state.charSelectChoices[state.hostId] = availableChars.splice(0, 3).map(c => c.id);
      state.charSelectChoices[state.guestId] = availableChars.splice(0, 3).map(c => c.id);
      
      appendLog(state, `游戏开始！请选择你们的角色。`);
      break;
    }
    case 'SELECT_CHARACTER': {
      if (state.phase !== 'CHAR_SELECT') return state;
      const player = state.players[action.payload.playerId];
      if (player.characterId) return state; // already picked
      
      const char = CHARACTERS.find(c => c.id === action.payload.characterId);
      if (!char) return state;
      
      player.characterId = char.id;
      player.maxHp = char.baseHp;
      player.hp = char.baseHp;
      player.baseAttackLevel = char.attackLevel;
      player.baseDefenseLevel = char.defenseLevel;
      player.attackLevel = char.attackLevel;
      player.defenseLevel = char.defenseLevel;
      
      // Expand initial dice
      player.dice = [];
      const diceLevels: DiceType[] = [1, 2, 3];
      char.initialDice.forEach((count, i) => {
        for (let j = 0; j < count; j++) {
          player.dice.push(diceLevels[i]);
        }
      });
      
      appendLog(state, `${player.name} 选择了角色 ${char.name}`);
      
      // If both selected, start round
      if (state.players[state.hostId].characterId && state.players[state.guestId!].characterId) {
        startRound(state);
      }
      break;
    }
    
    case 'TOGGLE_DICE': {
      if (state.phase !== 'ATTACK_ROLL' && state.phase !== 'DEFEND_ROLL') return state;
      
      const isAttack = state.phase === 'ATTACK_ROLL';
      const expectedPlayer = isAttack ? state.attackerId : state.defenderId;
      if (action.payload.playerId !== expectedPlayer) return state; // Only active player can toggle
      
      const player = state.players[action.payload.playerId];
      const idx = player.selectedDiceIds.indexOf(action.payload.diceId);
      if (idx !== -1) {
        player.selectedDiceIds.splice(idx, 1);
      } else {
        player.selectedDiceIds.push(action.payload.diceId);
      }
      break;
    }
    
    case 'REROLL': {
      if (state.phase !== 'ATTACK_ROLL' && state.phase !== 'DEFEND_ROLL') return state;
      const isAttack = state.phase === 'ATTACK_ROLL';
      const expectedPlayer = isAttack ? state.attackerId : state.defenderId;
      if (action.payload.playerId !== expectedPlayer) return state;
      
      const player = state.players[action.payload.playerId];
      if (player.rerolls <= 0 || player.selectedDiceIds.length === 0) return state;
      
      player.rerolls -= 1;
      // Find selected dice and re-roll their values
      player.selectedDiceIds.forEach(diceId => {
        const diceIdx = player.rolledDice.findIndex(d => d.id === diceId);
        if (diceIdx !== -1) {
          const type = player.rolledDice[diceIdx].type;
          player.rolledDice[diceIdx] = {
            id: generateId(),
            type,
            value: randomInt(1, DICE_SIDES[type])
          };
        }
      });
      // clear selection after reroll
      player.selectedDiceIds = [];
      appendLog(state, `${player.name} 使用了一次重投。`);
      break;
    }
    
    case 'CONFIRM_DICE': {
      if (state.phase !== 'ATTACK_ROLL' && state.phase !== 'DEFEND_ROLL') return state;
      
      const isAttack = state.phase === 'ATTACK_ROLL';
      const expectedPlayer = isAttack ? state.attackerId : state.defenderId;
      if (action.payload.playerId !== expectedPlayer) return state;
      
      const player = state.players[action.payload.playerId];
      const targetLevel = isAttack ? player.attackLevel : player.defenseLevel;
      
      if (player.selectedDiceIds.length !== targetLevel) {
        return state; // Must select exactly the required amount
      }
      
      // Move to next phase
      if (isAttack) {
        appendLog(state, `${player.name} 确定了攻击骰子。`);
        state.phase = 'DEFEND_ROLL';
        const defender = state.players[state.defenderId!];
        defender.rolledDice = rollDice(defender.dice);
        defender.selectedDiceIds = [];
        appendLog(state, `${defender.name} 开始防御！`);
      } else {
        appendLog(state, `${player.name} 确定了防御骰子。`);
        resolveCombat(state);
      }
      
      break;
    }
    case 'NEXT_ROUND': {
      if (state.phase !== 'RESOLUTION') return state;
      // Only host or guest? Either can click.
      startRound(state);
      break;
    }
  }
  
  return state;
};

