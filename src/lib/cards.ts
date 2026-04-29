import { CharacterCard } from './types';

export const CHARACTERS: CharacterCard[] = [
  {
    id: 'xiadie',
    name: '瑕蝶',
    baseHp: 27,
    attackLevel: 3,
    defenseLevel: 2,
    initialDice: [2, 1, 2],
    description: '作为防御方时，若受到的伤害值>8，则使【攻击等级】与【防御等级】+1；若受到伤害，且伤害值<=5，则立刻造成3点的【瞬伤】。'
  },
  {
    id: 'huangquan',
    name: '黄泉',
    baseHp: 33,
    attackLevel: 2,
    defenseLevel: 3,
    initialDice: [1, 1, 3],
    description: '作为攻击方时，若使用骰子点数全为4，则本次攻击获得【洞穿】，并使【攻击等级】+1。'
  },
  {
    id: 'liuying',
    name: '流萤',
    baseHp: 28,
    attackLevel: 4,
    defenseLevel: 3,
    initialDice: [2, 3, 0],
    description: '作为攻击方时，若使用骰子包含两组两个相同点数，则本次攻击获得【连击】。若生命值等于初始生命值，则本次攻击值+5。'
  },
  {
    id: 'zhirenniao',
    name: '知更鸟',
    baseHp: 30,
    attackLevel: 4,
    defenseLevel: 3,
    initialDice: [3, 2, 0],
    description: '作为攻击方时，若使用骰子全为偶数，则使所有使用骰子【升级】。'
  },
  {
    id: 'kafuka',
    name: '卡芙卡',
    baseHp: 30,
    attackLevel: 4,
    defenseLevel: 3,
    initialDice: [3, 2, 0],
    description: '作为攻击方时，使用的骰子每有一个不同点数，为对方添加一层【中毒】。作为防御方受到>=1点伤害时，移除对方一层【中毒】。'
  },
  {
    id: 'shajin',
    name: '砂金',
    baseHp: 33,
    attackLevel: 4,
    defenseLevel: 2,
    initialDice: [1, 3, 1],
    description: '作为攻击方时，使用的骰子每有一个奇数，使自己获得一层【韧性】。【韧性】至少达到7层时，移除7层韧性，并立刻造成7点【瞬伤】。'
  },
  {
    id: 'sanyueqi',
    name: '三月七',
    baseHp: 25,
    attackLevel: 4,
    defenseLevel: 3,
    initialDice: [3, 2, 0],
    description: '作为攻击方或防御方时，使用的骰子每包含一组两个相同点数，立刻造成3点【瞬伤】。'
  },
  {
    id: 'danheng',
    name: '丹恒·腾荒',
    baseHp: 25,
    attackLevel: 3,
    defenseLevel: 2,
    initialDice: [0, 3, 2],
    description: '作为攻击方时，若最终攻击值>=18，则下次防御的【防御等级】+3，并使该次防御获得【反击】，防御结束时将【防御等级】恢复至初始值。'
  },
  {
    id: 'huohua',
    name: '火花',
    baseHp: 22,
    attackLevel: 4,
    defenseLevel: 3,
    initialDice: [2, 2, 1],
    description: '作为攻击方或防御方时，若使用的骰子包含相同点数，则使该次攻击或防御触发时获得【骇入】。'
  },
  {
    id: 'xilian',
    name: '昔涟',
    baseHp: 30,
    attackLevel: 3,
    defenseLevel: 2,
    initialDice: [1, 3, 1],
    description: '回合结束时将自己的攻击值或防御值进行累加，若累加值>=24，则使【攻击等级】+2，此后每回合获得【骇入】（仅触发一次）。'
  },
  {
    id: 'fengjin',
    name: '风堇',
    baseHp: 28,
    attackLevel: 2,
    defenseLevel: 2,
    initialDice: [0, 4, 1],
    description: '作为攻击方时，攻击结束后将【力量】层数设置为本次攻击值的50%（向下取整），若使用骰子全为6，则设置为100%并回复3点生命值。'
  }
];

export const GLOSSARY: Record<string, string> = {
  '瞬伤': '触发效果时，立即使对方受到对应伤害。',
  '洞穿': '本次攻击无视对方防御值。',
  '连击': '本次攻击连续造成两次对应攻击值的伤害。',
  '升级': '骰子等级+1（最高为等级4，即12面骰）。',
  '中毒': '作为攻击方的回合开始时受到对应层数伤害。',
  '韧性': '作为防御方的回合结算时，将防御值增加对应层数。',
  '力量': '作为攻击方的回合结算时，将攻击值增加对应层数。',
  '反击': '作为防御方的回合结算时，使对方受到 max(最终防御值-最终攻击值, 0) 的伤害。',
  '骇入': '将对方决定使用的骰子中数值最大的一颗骰子更改为最小值(1)。',
  '攻击等级': '攻击时能选择的骰子数量。',
  '防御等级': '防御时能选择的骰子数量。',
};
