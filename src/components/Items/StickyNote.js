'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

export default function StickyNote({ item, onDelete, isHost }) {
  // Simple array of colors to pick from based on ID hash
  const colors = ['bg-note-yellow', 'bg-note-blue', 'bg-note-pink', 'bg-note-green'];
  const colorIndex = item.id.charCodeAt(0) % colors.length;
  const bgColorClass = colors[colorIndex];

  return (
    <div
      className={`absolute shadow-lg w-64 h-64 p-4 flex flex-col pt-8 animate-in ${bgColorClass}`}
      style={{
        left: item.x,
        top: item.y,
        /* subtle rotation for realism */
        transform: `rotate(${(item.id.charCodeAt(1) % 5) - 2}deg)`,
      }}
    >
      <button 
        onClick={() => onDelete(item.id)}
        className="absolute top-2 right-2 text-black/50 hover:text-black transition-colors bg-black/5 rounded-full p-1"
      >
        <X size={16} />
      </button>

      <div className="flex-1 w-full bg-transparent border-none resize-none outline-none text-black font-medium leading-relaxed overflow-auto overflow-wrap">
        {item.text}
      </div>
      
      {/* Tape decoration */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-white/20 backdrop-blur-sm shadow-sm rotate-2" />
    </div>
  );
}
