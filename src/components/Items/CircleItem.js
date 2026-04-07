'use client';

import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { useCanvas } from '../Canvas/CanvasContext';

export default function CircleItem({ item, onDelete, onUpdate, onDuplicate, isHost, activeTool, selected, onSelect, selectedIds, allItems }) {
  const { scale } = useCanvas();
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ pointerX: 0, pointerY: 0, items: [] });
  
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef({ x: 0, y: 0, scale: 1 });
  const containerRef = useRef(null);

  const handleDoubleClick = (e) => {
    if (activeTool === 'pointer' && isHost) {
      if (onSelect) onSelect(item.id, false);
      e.stopPropagation();
    }
  };

  const handlePointerDown = (e) => {
    if (activeTool !== 'pointer' || e.button !== 0) return;
    if (e.target.tagName.toLowerCase() === 'button' || e.target.closest('button')) return;

    e.stopPropagation();
    
    if (activeTool === 'pointer' && isHost && onSelect) {
      onSelect(item.id, e.shiftKey);
    }
    
    if (e.altKey && onDuplicate) {
      onDuplicate(item);
    }
    
    setIsDragging(true);
    
    const draggingItems = (selectedIds && selectedIds.includes(item.id))
      ? allItems.filter(i => selectedIds.includes(i.id))
      : [item];

    dragStartRef.current = { 
      pointerX: e.clientX, 
      pointerY: e.clientY, 
      items: draggingItems.map(i => ({ id: i.id, startX: i.x, startY: i.y }))
    };
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    e.stopPropagation();

    const dx = e.clientX - dragStartRef.current.pointerX;
    const dy = e.clientY - dragStartRef.current.pointerY;
    
    const deltaX = dx / scale;
    const deltaY = dy / scale;

    if (onUpdate) {
      dragStartRef.current.items.forEach(i => {
        onUpdate(i.id, { x: i.startX + deltaX, y: i.startY + deltaY });
      });
    }
  };

  const handlePointerUp = (e) => {
    if (isDragging) {
      e.stopPropagation();
      setIsDragging(false);
      e.target.releasePointerCapture(e.pointerId);
    }
  };

  const handleResizeDown = (e) => {
    if (activeTool !== 'pointer' || e.button !== 0) return;
    e.stopPropagation();
    setIsResizing(true);
    resizeStartRef.current = { x: e.clientX, y: e.clientY, scale: item.scale || 1 };
    e.target.setPointerCapture(e.pointerId);
  };

  const handleResizeMove = (e) => {
    if (!isResizing) return;
    e.stopPropagation();
    
    const dx = e.clientX - resizeStartRef.current.x;
    const sensitivity = 100 * scale; 
    const newScale = Math.max(0.2, resizeStartRef.current.scale + (dx / sensitivity));
    
    if (onUpdate) onUpdate(item.id, { scale: newScale });
  };

  const handleResizeUp = (e) => {
    if (isResizing) {
      e.stopPropagation();
      setIsResizing(false);
      e.target.releasePointerCapture(e.pointerId);
    }
  };

  const colors = [
    '#ffffff', '#000000', '#9ca3af', '#ef4444', '#f97316', 
    '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'
  ];

  return (
    <div
      ref={containerRef}
      className={`text-node ${isDragging || isResizing ? 'text-dragging' : 'text-idle'}`}
      style={{
        left: item.x,
        top: item.y,
        width: 100,
        height: 100,
        borderRadius: '50%',
        border: `4px solid ${item.color || '#ffffff'}`,
        transform: `scale(${item.scale || 1})`,
        transformOrigin: 'top left',
        zIndex: item.z_index !== undefined ? item.z_index : 2,
        transitionDuration: isDragging || isResizing ? '0ms' : '150ms',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 0,
        minWidth: 0,
        background: 'transparent'
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDoubleClick={handleDoubleClick}
    >
      <button 
        onClick={() => onDelete(item.id)}
        className="text-node-delete-btn"
      >
        <X size={12} />
      </button>

      {selected && isHost && (
        <div style={{
          position: 'absolute', top: '-50px', left: 0, display: 'flex', gap: '4px',
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', padding: '6px', 
          borderRadius: '8px', zIndex: 100, border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
        }}>
          {colors.map(c => (
            <button 
              key={c}
              onPointerDown={(e) => {
                e.stopPropagation();
                if (onUpdate) onUpdate(item.id, { color: c });
              }}
              style={{
                width: '18px', height: '18px', borderRadius: '50%', backgroundColor: c,
                border: item.color === c || (!item.color && c === '#ffffff') ? '2px solid white' : '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer'
              }}
            />
          ))}
        </div>
      )}

      {activeTool === 'pointer' && isHost && (
        <div 
          className="resize-handle"
          onPointerDown={handleResizeDown}
          onPointerMove={handleResizeMove}
          onPointerUp={handleResizeUp}
          onPointerCancel={handleResizeUp}
          title="Scale Circle"
        />
      )}
    </div>
  );
}
