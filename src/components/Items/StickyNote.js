'use client';

import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { useCanvas } from '../Canvas/CanvasContext';

export default function StickyNote({ item, onDelete, onUpdate, isHost, activeTool }) {
  const { scale } = useCanvas();
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const [isEditing, setIsEditing] = useState(!item.text); // auto-edit if empty
  const [localText, setLocalText] = useState(item.text);
  const inputRef = useRef(null);

  // Auto-focus when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleDoubleClick = (e) => {
    if (activeTool === 'pointer' && isHost) {
      setIsEditing(true);
      e.stopPropagation();
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (localText !== item.text && onUpdate) {
      // Ensure we push optimistic local update
      onUpdate(item.id, { text: localText });
    }
  };

  // Simple array of colors to pick from based on ID hash
  const colors = ['bg-note-yellow', 'bg-note-blue', 'bg-note-pink', 'bg-note-green'];
  const colorIndex = item.id.charCodeAt(0) % colors.length;
  const bgColorClass = colors[colorIndex];

  const handlePointerDown = (e) => {
    // Only drag with pointer tool and left mouse button
    if (activeTool !== 'pointer' || e.button !== 0) return;
    
    // Don't drag if clicking the delete button or typing in text
    if (e.target.tagName.toLowerCase() === 'button' || e.target.closest('button')) return;
    if (e.target.tagName.toLowerCase() === 'textarea' || e.target.tagName.toLowerCase() === 'input' || e.target.isContentEditable) return;

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
    
    // Scale delta appropriately to canvas coordinates
    const newX = item.x + dx / scale;
    const newY = item.y + dy / scale;

    // Optimistic local update
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
      className={`absolute w-64 h-64 p-5 flex flex-col pt-8 transition-all duration-300 group ${bgColorClass} ${isDragging ? 'shadow-2xl z-50 scale-105 cursor-grabbing' : 'hover:-translate-y-2 hover:scale-[1.02] cursor-grab'}`}
      style={{
        left: item.x,
        top: item.y,
        transform: isDragging ? 'none' : `rotate(${(item.id.charCodeAt(1) % 5) - 2}deg)`,
        boxShadow: isDragging ? 'var(--shadow-note-hover)' : 'var(--shadow-note)',
        borderRadius: '2px 12px 16px 2px',
        // prevent initial transition when dragging starts to stay snapped to mouse
        transitionDuration: isDragging ? '0ms' : '300ms'
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDoubleClick={handleDoubleClick}
    >
      <button 
        onClick={() => onDelete(item.id)}
        className="absolute top-2 right-2 text-black/40 hover:text-black transition-colors bg-black/5 hover:bg-black/10 rounded-full p-1 opacity-0 group-hover:opacity-100 z-10"
      >
        <X size={16} />
      </button>

      {/* Note: In a real app we might want this to be contentEditable and save text changes. */}
      {isEditing ? (
        <textarea
          ref={inputRef}
          value={localText}
          onChange={(e) => setLocalText(e.target.value)}
          onBlur={handleBlur}
          onPointerDown={(e) => e.stopPropagation()} // exclude drag while typing
          className="flex-1 w-full bg-transparent border-none resize-none outline-none text-black/80 font-medium text-lg leading-relaxed overflow-auto overflow-wrap"
          placeholder="Type here..."
        />
      ) : (
        <div className="flex-1 w-full bg-transparent border-none resize-none outline-none text-black/80 font-medium text-lg leading-relaxed overflow-auto overflow-wrap filter drop-shadow-sm select-none">
          {item.text || 'Double-click to edit'}
        </div>
      )}
      
      {/* Premium semi-transparent tape decoration */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-7 bg-white/30 backdrop-blur-md shadow-sm rotate-1 rounded-sm border border-white/20 pointer-events-none" />
      
      {/* Folded corner illusion */}
      <div className="absolute bottom-0 right-0 w-8 h-8 bg-black/5 rounded-tl-xl clip-path-fold pointer-events-none" style={{clipPath: 'polygon(100% 0, 0 100%, 100% 100%)'}} />
    </div>
  );
}
