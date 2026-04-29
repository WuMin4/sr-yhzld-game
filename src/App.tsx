import React, { useState } from 'react';
import { useGamePeer } from './lib/peerLogic';
import { CHARACTERS } from './lib/cards';
import { DiceRender } from './components/Dice';
import { GlossaryText } from './components/GlossaryText';
import { motion, AnimatePresence } from 'motion/react';
import { DiceType, GamePhase } from './lib/types';
import { Copy, Plus, Users } from 'lucide-react';

export default function App() {
  const { gameState, myId, myName, roomId, isHost, initHost, initGuest, dispatch } = useGamePeer();
  const [inputName, setInputName] = useState('');
  const [inputRoom, setInputRoom] = useState('');
  const [showTutorial, setShowTutorial] = useState(false);

  if (!gameState) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-space-900)] text-white p-4">
        <div className="max-w-md w-full card-panel p-8 rounded-xl shadow-2xl flex flex-col gap-6">
          <h1 className="text-4xl font-display font-bold text-center text-[var(--color-neon-blue)] tracking-wider">银河战力党</h1>
          <div className="text-sm text-gray-400 text-center">
            联机双人卡牌骰子对战游戏。玩家轮流利用骰子计算攻防。
            <button 
              onClick={() => setShowTutorial(true)} 
              className="block mx-auto mt-2 text-[var(--color-neon-blue)] hover:text-white underline"
            >
              📖 查看详细玩法教程
            </button>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-[var(--color-neon-pink)] font-bold">你的名字</label>
            <input 
              value={inputName} onChange={e => setInputName(e.target.value)} 
              className="bg-[var(--color-space-800)] border border-gray-600 rounded p-2 text-white focus:border-[var(--color-neon-blue)] outline-none"
              placeholder="请输入昵称"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => { if(inputName) initHost(inputName); }}
              className="glow-btn bg-[var(--color-space-700)] hover:bg-[var(--color-space-800)] border border-[var(--color-neon-blue)] text-[var(--color-neon-blue)] rounded p-3 font-bold flex gap-2 items-center justify-center disabled:opacity-50"
              disabled={!inputName}
            >
              <Plus size={18} /> 创建房间
            </button>
            <div className="flex flex-col gap-2">
              <input 
                value={inputRoom} onChange={e => setInputRoom(e.target.value)}
                className="bg-[var(--color-space-800)] border border-gray-600 rounded p-2 text-white outline-none focus:border-[var(--color-neon-pink)] h-12"
                placeholder="6位房间号"
                maxLength={6}
              />
              <button 
                onClick={() => { if(inputName && inputRoom.length === 6) initGuest(inputRoom, inputName); }}
                className="glow-btn bg-[var(--color-space-700)] border border-[var(--color-neon-pink)] text-[var(--color-neon-pink)] rounded p-2 font-bold flex gap-2 items-center justify-center disabled:opacity-50"
                disabled={!inputName || inputRoom.length !== 6}
              >
                <Users size={18} /> 加入房间
              </button>
            </div>
          </div>
        </div>

        {/* Tutorial Modal */}
        {showTutorial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setShowTutorial(false)}>
            <div className="card-panel max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8 rounded-xl shadow-2xl relative" onClick={e => e.stopPropagation()}>
              <button 
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                onClick={() => setShowTutorial(false)}
              >
                ✕
              </button>
              <h2 className="text-2xl font-bold text-[var(--color-neon-blue)] mb-6 font-display">游戏玩法教程</h2>
              
              <div className="space-y-6 text-gray-300">
                <section>
                  <h3 className="text-lg font-bold text-white mb-2 pb-1 border-b border-gray-700">1. 基础玩法</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>游戏为双人在线联机对战。两名玩家轮流进行攻防，生命值不会超过各自角色的基础生命值。</li>
                    <li>每位玩家拥有若干个不同的骰子（四面蓝骰、六面紫骰、八面金骰、十二面彩骰）。</li>
                    <li>最终造成的伤害或防御由你选择的骰子点数之和决定。</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-white mb-2 pb-1 border-b border-gray-700">2. 游戏流程</h3>
                  <p className="mb-2"><strong>第一步：选择角色</strong></p>
                  <ul className="list-disc pl-5 space-y-1 mb-4">
                    <li>系统随机从所有角色中为你和对手分别抽取3名角色。你们需要各自从中选择1名角色进行对战。不同的角色会带来不同的骰子配置、攻击/防御能力及专属技能。</li>
                  </ul>

                  <p className="mb-2"><strong>第二步：回合交锋</strong></p>
                  <ul className="list-disc pl-5 space-y-1 mb-4">
                    <li>第一回合系统会随机决定谁先攻击。后续回合双方自动交换攻防身份。</li>
                  </ul>

                  <p className="mb-2"><strong>第三步：攻击方行动</strong></p>
                  <ul className="list-disc pl-5 space-y-1 mb-4">
                    <li>系统自动投出你所有的骰子。你需要从中挑选出数量刚好等于你的<span className="text-[var(--color-neon-gold)]">【攻击等级】</span>的骰子。</li>
                    <li>如果不满意投出的结果，你可以消耗重投次数（初始2次）重新投掷<strong>已选中的骰子</strong>。</li>
                    <li>确认之后，所选骰子的点数之和即为你的基础攻击值。此时轮到防御方思考。</li>
                  </ul>

                  <p className="mb-2"><strong>第四步：防御方行动</strong></p>
                  <ul className="list-disc pl-5 space-y-1 mb-4">
                    <li>系统自动投出防御方所有的骰子。防御方需要从中挑选出数量刚好等于其<span className="text-[var(--color-neon-gold)]">【防御等级】</span>的骰子。</li>
                    <li>防御方初始没有重投机会。</li>
                    <li>确认之后，所选骰子的点数之和即为基础防御值。然后进入结算阶段。</li>
                  </ul>

                  <p className="mb-2"><strong>第五步：结算阶段</strong></p>
                  <ul className="list-disc pl-5 space-y-1 mb-4">
                    <li>防御方将受到伤害计算：<code className="bg-gray-800 px-1 rounded text-red-300">max(最终攻击值 - 最终防御值, 0)</code> 的伤害。</li>
                    <li>各种具有特殊词条（如【瞬伤】、【骇入】、【洞穿】）的技能会在此时或掷骰子阶段结算完毕。</li>
                    <li>结算完毕后进入下一回合，双方攻防身份互换。任一方生命值归零则游戏结束。</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-white mb-2 pb-1 border-b border-gray-700">3. 界面小提示</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>点击带有【】括号的高亮词汇（例如 <span className="text-[var(--color-neon-blue)] border-b border-dotted cursor-help">【瞬伤】</span>），会弹出相关效果的名词解释。</li>
                    <li>时刻注意自己的【骰子数量与颜色】，策略性地进行重投，不要盲目贪图大点数而忽略了角色技能的触发条件！</li>
                  </ul>
                </section>
              </div>

              <div className="mt-8 text-center">
                <button 
                  onClick={() => setShowTutorial(false)}
                  className="bg-[var(--color-space-700)] border border-gray-500 hover:bg-gray-700 text-white px-6 py-2 rounded font-bold transition-colors"
                >
                  我已了解
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const handleCopyRoom = () => {
    navigator.clipboard.writeText(roomId);
  };

  const isMyTurn = (gameState.phase === 'ATTACK_ROLL' && gameState.attackerId === myId) || 
                   (gameState.phase === 'DEFEND_ROLL' && gameState.defenderId === myId);

  const me = gameState.players[myId];
  const opponentId = isHost ? gameState.guestId : gameState.hostId;
  const opponent = opponentId ? gameState.players[opponentId] : null;

  const getSelectedSum = (player: any) => {
    return player.rolledDice
      .filter((d: any) => player.selectedDiceIds.includes(d.id))
      .reduce((sum: number, d: any) => sum + d.value, 0);
  };

  return (
    <div className="min-h-screen bg-[var(--color-space-900)] text-white font-sans flex flex-col">
      <header className="border-b border-white/10 bg-black/50 p-4 flex justify-between items-center z-10 sticky top-0 backdrop-blur-md">
        <h1 className="text-xl font-display font-bold text-[var(--color-neon-blue)]">银河战力党</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">房间号：</span>
          <button onClick={handleCopyRoom} className="flex items-center gap-2 bg-[var(--color-space-800)] px-3 py-1 rounded hover:text-[var(--color-neon-gold)] transition-colors">
            <span className="font-mono text-lg font-bold tracking-widest">{roomId}</span>
            <Copy size={16} />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
        <div className="lg:col-span-2 flex flex-col space-y-6">
          {/* LOBBY PHASE */}
          {gameState.phase === 'LOBBY' && (
            <div className="card-panel p-8 text-center rounded-xl">
              <h2 className="text-2xl font-bold mb-4">等待对手中...</h2>
              <p className="text-gray-400">将上方房间号分享给你的好友。</p>
            </div>
          )}

          {/* CHAR_SELECT PHASE */}
          {gameState.phase === 'CHAR_SELECT' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[var(--color-neon-pink)] border-b border-[var(--color-neon-pink)] pb-2 inline-block">选择你的角色</h2>
              {me.characterId ? (
                <div className="card-panel p-6 rounded-xl text-center">已选择，等待对手...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {gameState.charSelectChoices[myId]?.map(cid => {
                    const char = CHARACTERS.find(c => c.id === cid)!;
                    return (
                      <motion.div 
                        key={cid} 
                        whileHover={{ scale: 1.02 }} 
                        className="card-panel p-4 rounded-xl cursor-pointer border-transparent hover:border-[var(--color-neon-blue)]"
                        onClick={() => dispatch({ type: 'SELECT_CHARACTER', payload: { playerId: myId, characterId: cid } })}
                      >
                        <h3 className="text-xl font-bold text-[var(--color-neon-gold)]">{char.name}</h3>
                        <div className="text-sm font-mono text-gray-300 my-2">
                          HP: {char.baseHp} | A: {char.attackLevel} | D: {char.defenseLevel}
                        </div>
                        <div className="text-xs text-gray-400 mb-2">初始骰子: {char.initialDice.join('/')}</div>
                        <div className="text-sm">
                          <GlossaryText text={char.description} />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* GAME PHASES */}
          {gameState.phase !== 'LOBBY' && gameState.phase !== 'CHAR_SELECT' && (
            <div className="flex flex-col gap-6">
              {/* Opponent Area */}
              {opponent && (
                <div className="card-panel p-4 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-red-500/20 text-red-500 text-xs px-2 py-1 rounded-bl-lg font-bold">对手</div>
                  <PlayerHeader player={opponent} />
                  <PlayerStatus player={opponent} />
                  {opponent.characterId && (
                    <div className="mt-4 p-3 bg-black/30 rounded text-sm text-gray-300">
                      <GlossaryText text={CHARACTERS.find(c => c.id === opponent.characterId)!.description} />
                    </div>
                  )}
                </div>
              )}

              {/* Center Arena */}
              <div className="card-panel p-6 rounded-xl border-dashed border-[var(--color-neon-blue)] flex flex-col items-center justify-center min-h-[200px]">
                <h3 className="font-display text-xl text-[var(--color-neon-gold)] mb-4">{
                  gameState.phase === 'ATTACK_ROLL' ? '攻击准备' : 
                  gameState.phase === 'DEFEND_ROLL' ? '防御准备' :
                  gameState.phase === 'RESOLUTION' ? '战斗结算' : 
                  gameState.phase === 'ROUND_START' ? '回合开始' : 
                  gameState.phase === 'GAME_OVER' ? '游戏结束' : ''
                }</h3>

                {/* Roll Area */}
                {['ATTACK_ROLL', 'DEFEND_ROLL'].includes(gameState.phase) && (
                  <div className="w-full">
                    {/* Live Calculation Display */}
                    <div className="flex justify-between items-center px-8 mb-6">
                      <div className="text-center">
                        <div className="text-sm text-red-400">当前攻击值</div>
                        <div className="text-2xl font-bold text-red-300">
                          {gameState.phase === 'ATTACK_ROLL' 
                            ? getSelectedSum(gameState.players[gameState.attackerId!]) 
                            : getSelectedSum(gameState.players[gameState.attackerId!])}
                        </div>
                      </div>
                      <div className="text-xl font-bold font-display text-[var(--color-neon-blue)]">
                        VS
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-blue-400">当前防御值</div>
                        <div className="text-2xl font-bold text-blue-300">
                          {gameState.phase === 'DEFEND_ROLL' 
                            ? getSelectedSum(gameState.players[gameState.defenderId!]) 
                            : '?'}
                        </div>
                      </div>
                    </div>

                    {/* Opponent rolling */}
                    {!isMyTurn && (
                       <div className="text-center text-gray-400 mb-4 animate-pulse">
                         对手正在思考与选择骰子... ({gameState.phase === 'ATTACK_ROLL' ? '攻击' : '防御'})
                       </div>
                    )}
                    
                    {/* Active Dice Area */}
                    <div className="flex flex-wrap gap-4 justify-center">
                      {(isMyTurn ? me : opponent)?.rolledDice.map(d => (
                        <DiceRender 
                          key={d.id} 
                          type={d.type} 
                          value={d.value} 
                          selected={(isMyTurn ? me : opponent)?.selectedDiceIds.includes(d.id)}
                          onClick={isMyTurn ? () => dispatch({ type: 'TOGGLE_DICE', payload: { playerId: myId, diceId: d.id } }) : undefined}
                        />
                      ))}
                    </div>

                    {/* Actions */}
                    {isMyTurn && (
                      <div className="mt-8 flex justify-center gap-4">
                        <button 
                          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded font-bold disabled:opacity-50"
                          disabled={me.selectedDiceIds.length === 0 || me.rerolls <= 0}
                          onClick={() => dispatch({ type: 'REROLL', payload: { playerId: myId } })}
                        >
                          重投已选 ({me.rerolls}次)
                        </button>
                        <button 
                          className="glow-btn bg-[var(--color-neon-blue)] hover:bg-blue-400 text-black px-6 py-2 rounded font-bold disabled:opacity-50 disabled:bg-gray-600 disabled:text-gray-400"
                          disabled={me.selectedDiceIds.length !== (gameState.phase === 'ATTACK_ROLL' ? me.attackLevel : me.defenseLevel)}
                          onClick={() => dispatch({ type: 'CONFIRM_DICE', payload: { playerId: myId } })}
                        >
                          确认使用 ({me.selectedDiceIds.length}/{gameState.phase === 'ATTACK_ROLL' ? me.attackLevel : me.defenseLevel})
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* RESOLUTION Area */}
                {gameState.phase === 'RESOLUTION' && gameState.combatResult && (
                  <div className="w-full flex flex-col items-center gap-6">
                    <div className="flex gap-4 w-full justify-around items-center">
                      <div className="text-center">
                        <div className="text-sm text-red-400 mb-2">{gameState.players[gameState.attackerId!].name} (攻击方)</div>
                        <div className="flex gap-2 justify-center">
                          {gameState.players[gameState.attackerId!].rolledDice.filter(d => gameState.players[gameState.attackerId!].selectedDiceIds.includes(d.id)).map(d => (
                            <DiceRender key={d.id} type={d.type} value={d.value} selected />
                          ))}
                        </div>
                        <div className="mt-2 text-2xl font-bold text-red-500 border-t border-red-500/30 pt-1">
                          {gameState.combatResult.atkValue}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-2xl font-bold text-[var(--color-neon-gold)] mb-2 font-display italic">VS</div>
                        {gameState.combatResult.pierce && (
                          <div className="bg-[var(--color-neon-pink)] text-black font-bold px-2 py-0.5 rounded text-xs animate-pulse">
                            <GlossaryText text="【洞穿】" />生效
                          </div>
                        )}
                        {gameState.combatResult.combo && (
                          <div className="bg-[var(--color-neon-gold)] text-black font-bold px-2 py-0.5 mt-1 rounded text-xs animate-pulse">
                            <GlossaryText text="【连击】" />生效
                          </div>
                        )}
                      </div>

                      <div className="text-center">
                        <div className="text-sm text-blue-400 mb-2">{gameState.players[gameState.defenderId!].name} (防御方)</div>
                        <div className="flex gap-2 justify-center">
                          {gameState.players[gameState.defenderId!].rolledDice.filter(d => gameState.players[gameState.defenderId!].selectedDiceIds.includes(d.id)).map(d => (
                            <DiceRender key={d.id} type={d.type} value={d.value} selected />
                          ))}
                        </div>
                        <div className={`mt-2 text-2xl font-bold border-t pt-1 ${gameState.combatResult.pierce ? 'text-gray-500 line-through border-gray-500/30' : 'text-blue-500 border-blue-500/30'}`}>
                          {gameState.combatResult.defValue}
                        </div>
                      </div>
                    </div>
                    {isHost && (
                      <button 
                        className="glow-btn bg-[var(--color-neon-gold)] text-black px-6 py-2 rounded font-bold mt-4"
                        onClick={() => dispatch({ type: 'NEXT_ROUND' })}
                      >
                        进入下一回合
                      </button>
                    )}
                    {!isHost && (
                      <div className="text-gray-400 animate-pulse mt-4">等待房主继续...</div>
                    )}
                  </div>
                )}
                
                {/* GAME OVER */}
                {gameState.phase === 'GAME_OVER' && (
                  <div className="text-[var(--color-neon-gold)] text-3xl font-bold font-display animate-bounce mt-4">
                    游戏结束！
                  </div>
                )}
              </div>

              {/* My Area */}
              <div className="card-panel p-4 rounded-xl border-[var(--color-neon-pink)]/50 relative">
                <div className="absolute top-0 right-0 bg-[var(--color-neon-pink)]/20 text-[var(--color-neon-pink)] text-xs px-2 py-1 rounded-bl-lg font-bold">你</div>
                <PlayerHeader player={me} />
                <PlayerStatus player={me} />
                {me.characterId && (
                  <div className="mt-4 p-3 bg-black/30 rounded text-sm text-gray-300">
                    <GlossaryText text={CHARACTERS.find(c => c.id === me.characterId)!.description} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* LOG SECTION */}
        <div className="card-panel rounded-xl flex flex-col h-[600px] lg:h-auto overflow-hidden">
          <div className="bg-black/40 p-3 font-bold border-b border-white/10 text-[var(--color-neon-blue)] flex justify-between">
            <span>战斗日志</span>
            <span className="text-xs text-gray-500 font-mono">T{gameState.turnNumber}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
            <AnimatePresence>
              {gameState.logs.map(log => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }}
                  key={log.id} 
                  className={`text-sm p-2 rounded ${
                    log.type === 'skill' ? 'bg-[var(--color-neon-gold)]/20 text-[var(--color-neon-gold)]' :
                    log.type === 'damage' ? 'bg-red-500/20 text-red-300' :
                    log.type === 'effect' ? 'bg-[var(--color-neon-pink)]/20 text-[var(--color-neon-pink)]' :
                    'bg-white/5 text-gray-300'
                  }`}
                >
                  <span className="opacity-50 text-xs mr-2">{new Date(log.timestamp).toLocaleTimeString([], {hour12:false})}</span>
                  <GlossaryText text={log.message} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

function PlayerHeader({ player }: { player: any }) {
  const char = CHARACTERS.find(c => c.id === player.characterId);
  return (
    <div className="flex justify-between items-end mb-2 border-b border-white/10 pb-2">
      <div>
        <div className="text-xl font-bold font-display">{player.name}</div>
        <div className="text-[var(--color-neon-gold)] text-sm">{char?.name || '未知'}</div>
      </div>
      <div className="text-right">
        <div className="font-mono text-2xl font-bold text-green-400">
          HP: {player.hp} <span className="text-sm opacity-50">/ {player.maxHp}</span>
        </div>
        <div className="text-sm text-gray-400 font-mono flex gap-2 justify-end">
           <span><GlossaryText text="【攻击等级】" />: {player.attackLevel}</span>
           <span><GlossaryText text="【防御等级】" />: {player.defenseLevel}</span>
        </div>
      </div>
    </div>
  );
}

function PlayerStatus({ player }: { player: any }) {
  const statuses = [
    { key: 'poison', icon: '☠️', label: '中毒' },
    { key: 'toughness', icon: '🛡️', label: '韧性' },
    { key: 'strength', icon: '⚔️', label: '力量' },
    { key: 'hack', icon: '💻', label: '骇入' }
  ].filter(s => player.statuses[s.key] > 0);

  return (
    <div className="flex gap-4 items-center">
      <div className="flex gap-1">
        {player.dice.map((d: DiceType, i: number) => (
          <div key={i} className={`w-4 h-4 rounded-sm flex items-center justify-center text-[10px] font-bold ${
            d===1 ? 'bg-blue-500 text-blue-900 clip-triangle' :
            d===2 ? 'bg-purple-500 text-purple-900 rounded-sm' :
            d===3 ? 'bg-yellow-500 text-yellow-900 rounded-full' :
            'bg-gradient-to-br from-red-500 via-green-500 to-blue-500 text-white rounded-lg'
          }`}>
            {d}
          </div>
        ))}
      </div>
      {statuses.length > 0 && (
        <div className="flex gap-2 ml-auto">
          {player.characterId === 'xilian' && (
            <div className="bg-black/50 px-2 py-0.5 rounded text-xs flex items-center gap-1 border border-white/20 text-[var(--color-neon-blue)]" title="昔涟累加值">
              🔄 {player.xilianAccumulation}/24
            </div>
          )}
          {statuses.map(s => (
            <div key={s.key} className="bg-black/50 px-2 py-0.5 rounded text-xs flex items-center gap-1 border border-white/20" title={s.label}>
              {s.icon} {player.statuses[s.key]}
            </div>
          ))}
        </div>
      )}
      {statuses.length === 0 && player.characterId === 'xilian' && (
        <div className="ml-auto bg-black/50 px-2 py-0.5 rounded text-xs flex items-center gap-1 border border-white/20 text-[var(--color-neon-blue)]" title="昔涟累加值">
          🔄 {player.xilianAccumulation}/24
        </div>
      )}
    </div>
  );
}
