import React from 'react';
import { cn } from '../lib/utils';
import { DiceType } from '../lib/types';
import { motion } from 'motion/react';

const DICE_COLORS: Record<DiceType, string> = {
  1: 'bg-blue-500/20 border-blue-500 text-blue-400',
  2: 'bg-purple-500/20 border-purple-500 text-purple-400',
  3: 'bg-yellow-500/20 border-yellow-500 text-yellow-400',
  4: 'bg-gradient-to-br from-red-500/30 via-green-500/30 to-blue-500/30 border-white text-white',
};

const DICE_SHAPES: Record<DiceType, string> = {
  1: 'clip-triangle', // 4-sided (triangle projection)
  2: 'rounded-md',    // 6-sided (square)
  3: 'rounded-full',  // 8-sided (circle/diamond logic)
  4: 'rounded-lg',    // 12-sided (dodecagon logic)
};

export const DiceRender: React.FC<{ 
  type: DiceType; value: number; selected?: boolean; onClick?: () => void 
}> = ({ 
  type, value, selected, onClick 
}) => {
  return (
    <div className={cn(
      "relative transition-transform", 
      selected ? "drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] scale-110 z-10" : "scale-100 z-0",
      !onClick && "opacity-90"
    )}>
      <motion.button
        whileHover={{ scale: onClick && !selected ? 1.05 : 1 }}
        whileTap={{ scale: onClick ? 0.95 : 1 }}
        onClick={onClick}
        disabled={!onClick}
        className={cn(
          "relative flex items-center justify-center w-14 h-14 border-2 font-display text-xl font-bold transition-all",
          DICE_COLORS[type],
          DICE_SHAPES[type],
          selected && type === 1 ? 'bg-blue-400 text-blue-900 border-white' : '', // Explicit colors for selected D4
          selected && type !== 1 ? 'ring-2 ring-white border-white bg-white/20' : '',
          !selected && 'backdrop-blur-sm shadow-lg',
          !onClick && 'cursor-default'
        )}
      >
        {value}
      </motion.button>
    </div>
  );
};
