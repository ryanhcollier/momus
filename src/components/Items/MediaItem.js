'use client';

import { X } from 'lucide-react';

export default function MediaItem({ item, onDelete, isHost }) {
  // Items without width/height will just use natural size bounded by max-w
  
  return (
    <div
      className="absolute shadow-2xl rounded-lg group animate-in ring-1 ring-white/10"
      style={{
        left: item.x,
        top: item.y,
        width: item.width || 'auto',
        height: item.height || 'auto',
      }}
    >
      {isHost && (
        <button 
          onClick={() => onDelete(item.id)}
          className="absolute -top-3 -right-3 z-10 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-110"
        >
          <X size={16} />
        </button>
      )}

      {item.type === 'image' ? (
        <img 
          src={item.url} 
          alt="Board media" 
          className="rounded-lg object-contain max-w-2xl max-h-2xl pointer-events-none" 
          draggable={false}
        />
      ) : (
        <video 
          src={item.url} 
          controls 
          className="rounded-lg max-w-3xl border border-white/5"
        />
      )}
    </div>
  );
}
