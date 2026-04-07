'use client';

import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { useCanvas } from '../Canvas/CanvasContext';

export default function ArtboardItem({ item, onDelete, onUpdate, onDuplicate, isHost, activeTool, allItems = [], selected, onSelect, selectedIds }) {
  const { scale } = useCanvas();
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ pointerX: 0, pointerY: 0, itemX: 0, itemY: 0 });
  const childrenRef = useRef([]); // Track items trapped strictly inside this artboard bounds

  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef({ x: 0, y: 0, scale: 1 });

  const [isEditing, setIsEditing] = useState(false);
  const [localTitle, setLocalTitle] = useState(item.content || 'Artboard');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e) => {
    if (activeTool === 'pointer' && isHost) {
      setIsEditing(true);
      if (onSelect) onSelect(item.id, false);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (localTitle !== item.content && onUpdate) {
      onUpdate(item.id, { content: localTitle || 'Artboard' });
    }
  };

  const handlePointerDown = (e) => {
    if (activeTool !== 'pointer' || e.button !== 0) return;
    if (e.target.tagName.toLowerCase() === 'button' || e.target.closest('button')) return;
    if (e.target.tagName.toLowerCase() === 'input') return;

    e.stopPropagation();
    
    if (activeTool === 'pointer' && isHost && onSelect) {
      onSelect(item.id, e.shiftKey);
    }
    
    if (e.altKey && onDuplicate) {
      onDuplicate(item);
    }
    
    const draggingItemsMap = new Map();
    // 1. Add spatial geometric structural children (classic Artboard drag)
    const width = 640 * (item.scale || 1);
    const height = 360 * (item.scale || 1);
    allItems.forEach(child => {
      if (child.id === item.id || child.type === 'artboard') return;
      if (child.x >= item.x && child.x <= (item.x + width) &&
          child.y >= item.y && child.y <= (item.y + height)) {
        draggingItemsMap.set(child.id, { id: child.id, startX: child.x, startY: child.y });
      }
    });

    // 2. Add explicit active multi-selected items (if this Artboard is one of the targeted masters)
    if (selectedIds && selectedIds.includes(item.id)) {
      allItems.forEach(i => {
        if (selectedIds.includes(i.id)) {
          draggingItemsMap.set(i.id, { id: i.id, startX: i.x, startY: i.y });
        }
      });
    }

    // 3. Anchor the Artboard itself into the drag matrix
    draggingItemsMap.set(item.id, { id: item.id, startX: item.x, startY: item.y });

    childrenRef.current = Array.from(draggingItemsMap.values());
    
    setIsDragging(true);
    dragStartRef.current = { 
      pointerX: e.clientX, 
      pointerY: e.clientY, 
      itemX: item.x, 
      itemY: item.y 
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

    const newX = dragStartRef.current.itemX + deltaX;
    const newY = dragStartRef.current.itemY + deltaY;

    if (onUpdate) {
      childrenRef.current.forEach(child => {
        onUpdate(child.id, { x: child.startX + deltaX, y: child.startY + deltaY });
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

  // Resizing handlers
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
    const sensitivity = 400 * scale; 
    const newScale = Math.max(0.1, resizeStartRef.current.scale + (dx / sensitivity));
    
    if (onUpdate) onUpdate(item.id, { scale: newScale });
  };

  const handleResizeUp = (e) => {
    if (isResizing) {
      e.stopPropagation();
      setIsResizing(false);
      e.target.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div
      className={`artboard-item ${isDragging || isResizing ? 'artboard-dragging' : 'artboard-idle'}`}
      style={{
        left: item.x,
        top: item.y,
        transform: `scale(${item.scale || 1})`,
        transformOrigin: 'top left',
        zIndex: item.z_index !== undefined ? item.z_index : 1,
      }}
    >
      <div 
        className="artboard-label-tab flex-center-gap"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={handleDoubleClick}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            onBlur={handleBlur}
            onPointerDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => { if (e.key === 'Enter') handleBlur(); }}
            className="artboard-input"
          />
        ) : (
          <span className="artboard-display">
            {item.content || 'Artboard'}
          </span>
        )}

        {isResizing && (
          <span className="artboard-display" style={{ color: '#3b82f6' }}>
            {Math.round(640 * (item.scale || 1))} x {Math.round(360 * (item.scale || 1))}
          </span>
        )}

        {isHost && (
          <button 
            onClick={() => onDelete(item.id)}
            style={{ color: '#ef4444' }}
            className="artboard-delete-btn"
          >
            <X size={12} />
          </button>
        )}
      </div>

      <div className="artboard-frame" style={{
        outline: selected ? '2px solid #3b82f6' : 'none',
        outlineOffset: '4px',
        borderRadius: '2px'
      }} />

      {activeTool === 'pointer' && isHost && (
        <div 
          className="resize-handle"
          onPointerDown={handleResizeDown}
          onPointerMove={handleResizeMove}
          onPointerUp={handleResizeUp}
          onPointerCancel={handleResizeUp}
        />
      )}
    </div>
  );
}
