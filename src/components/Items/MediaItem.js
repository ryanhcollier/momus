'use client';

import { useState, useRef } from 'react';
import { X } from 'lucide-react';
import { useCanvas } from '../Canvas/CanvasContext';

export default function MediaItem({ item, onDelete, onUpdate, onDuplicate, isHost, activeTool }) {
  const { scale } = useCanvas();
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ pointerX: 0, pointerY: 0, itemX: 0, itemY: 0 });

  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef({ x: 0, y: 0, scale: 1 });

  const handlePointerDown = (e) => {
    if (activeTool !== 'pointer' || e.button !== 0) return;
    if (e.target.tagName.toLowerCase() === 'button' || e.target.closest('button')) return;

    e.stopPropagation();
    
    if (e.shiftKey && onDuplicate) {
      onDuplicate(item);
    }
    
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
    
    const newX = dragStartRef.current.itemX + dx / scale;
    const newY = dragStartRef.current.itemY + dy / scale;

    if (onUpdate) onUpdate(item.id, { x: newX, y: newY });
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
