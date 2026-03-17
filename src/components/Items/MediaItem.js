'use client';

import { useState, useRef } from 'react';
import { X } from 'lucide-react';
import { useCanvas } from '../Canvas/CanvasContext';

export default function MediaItem({ item, onDelete, onUpdate, isHost, activeTool }) {
  const { scale } = useCanvas();
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e) => {
    // Only drag with pointer tool and left mouse button
    if (activeTool !== 'pointer' || e.button !== 0) return;
    
    if (e.target.tagName.toLowerCase() === 'button' || e.target.closest('button')) return;
    
    // For video, we might want to interact with controls. 
    // Usually clicking on a video allows dragging unless clicking play/pause, but browsers handle video controls shadow dom loosely.
    // If it's a video and we click slightly inside, it might trigger drag. We'll allow it for now.

    e.stopPropagation(); // prevent canvas pan
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    e.stopPropagation();

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    
    const newX = item.x + dx / scale;
    const newY = item.y + dy / scale;

    if (onUpdate) onUpdate(item.id, { x: newX, y: newY });
    
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e) => {
    if (isDragging) {
      e.stopPropagation();
      setIsDragging(false);
      e.target.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div
      className={`absolute shadow-2xl rounded-xl group ring-1 ring-white/10 overflow-hidden ${isDragging ? 'z-50 cursor-grabbing' : 'hover:ring-white/30 cursor-grab'}`}
      style={{
        left: item.x,
        top: item.y,
        width: item.width || 'auto',
        height: item.height || 'auto',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {isHost && (
        <button 
          onClick={() => onDelete(item.id)}
          className="absolute top-2 right-2 z-20 w-8 h-8 bg-black/60 backdrop-blur-md text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-500 hover:scale-110 border border-white/20"
        >
          <X size={16} />
        </button>
      )}

      {item.type === 'image' ? (
        <img 
          src={item.url} 
          alt="Board media" 
          className="rounded-xl object-contain max-w-2xl max-h-[80vh] pointer-events-none" 
          draggable={false}
        />
      ) : (
        <video 
          src={item.url} 
          controls 
          className="rounded-xl max-w-3xl max-h-[80vh] border-none bg-black/20"
        />
      )}
    </div>
  );
}
