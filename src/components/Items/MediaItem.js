'use client';

import { useState, useRef } from 'react';
import { X } from 'lucide-react';
import { useCanvas } from '../Canvas/CanvasContext';

export default function MediaItem({ item, onDelete, onUpdate, onDuplicate, isHost, activeTool, selected, onSelect, selectedIds, allItems }) {
  const { scale } = useCanvas();
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ pointerX: 0, pointerY: 0, items: [] });

  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef({ x: 0, y: 0, scale: 1 });

  const handlePointerDown = (e) => {
    if (activeTool !== 'pointer' || e.button !== 0) return;
    if (e.target.tagName.toLowerCase() === 'button' || e.target.closest('button')) return;

    e.stopPropagation();
    
    // Process explicit item selection matrix
    if (activeTool === 'pointer' && isHost && onSelect) {
      onSelect(item.id, e.shiftKey);
    }
    
    // Alt/Option key remapped for duplicate features
    if (e.altKey && onDuplicate) {
      onDuplicate(item);
    }
    
    setIsDragging(true);
    
    // Gather all targets natively if this item is inside the active selection
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
    const sensitivity = 200 * scale; 
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
      className={`media-item ${isDragging || isResizing ? 'media-dragging' : 'media-idle'}`}
      style={{
        left: item.x,
        top: item.y,
        width: item.width || 'auto',
        height: item.height || 'auto',
        transform: `scale(${item.scale || 1})`,
        transformOrigin: 'top left',
        zIndex: item.z_index !== undefined ? item.z_index : 2,
        outline: selected ? '2px solid #3b82f6' : 'none',
        outlineOffset: '4px',
        borderRadius: '4px'
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {isHost && (
        <button 
          className="media-delete-btn"
          onClick={() => onDelete(item.id)}
        >
          <X size={12} />
        </button>
      )}

      {item.type === 'image' ? (
        <img 
          src={item.url} 
          alt="Board media" 
          className="media-image" 
          draggable={false}
        />
      ) : (
        <video 
          src={item.url} 
          controls 
          className="media-video"
        />
      )}

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
