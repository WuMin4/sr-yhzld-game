import React, { useState } from 'react';
import { GLOSSARY } from '../lib/cards';

export function GlossaryText({ text }: { text: string }) {
  const parts = text.split(/(【.*?】)/);
  
  return (
    <span className="leading-relaxed">
      {parts.map((p, i) => {
        if (p.startsWith('【') && p.endsWith('】')) {
          const keyword = p.slice(1, -1);
          const expl = GLOSSARY[keyword];
          if (expl) {
            return (
              <span key={i} className="group relative glossary-tooltip transition-colors hover:text-neon-pink">
                {p}
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 text-xs font-sans bg-space-800 border border-neon-blue rounded opacity-0 group-hover:opacity-100 pointer-events-none z-50 shadow-xl shadow-neon-blue/20">
                  {expl}
                </span>
              </span>
            );
          }
        }
        return <span key={i}>{p}</span>;
      })}
    </span>
  );
}
