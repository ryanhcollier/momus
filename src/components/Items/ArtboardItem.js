'use client';

import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { useCanvas } from '../Canvas/CanvasContext';

export default function ArtboardItem({ item, onDelete, onUpdate, onDuplicate, isHost, activeTool, allItems = [] }) {
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
      e.stopPropagation();
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
    
    if (e.shiftKey && onDuplicate) {
      onDuplicate(item);
    }
    
    // Capture any items fully or partially sitting on top of the artboard at initialization
    const width = 640 * (item.scale || 1);
    const height = 360 * (item.scale || 1);
    childrenRef.current = allItems.filter(child => {
      if (child.id === item.id || child.type === 'artboard') return false;
      return child.x >= item.x && child.x <= (item.x + width) &&
             child.y >= item.y && child.y <= (item.y + height);
    }).map(c => ({ id: c.id, startX: c.x, startY: c.y }));
    
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
      onUpdate(item.id, { x: newX, y: newY });
      
      // Cascade structural move to items physically positioned within it based on absolute start coords
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

        {isHost && (
          <button 
            onClick={() => onDelete(item.id)}
            style={{ color: '#ef4444' }}
            className="artboard-delete-btn"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="artboard-frame" />

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
