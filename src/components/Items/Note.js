'use client';

import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { useCanvas } from '../Canvas/CanvasContext';

export default function Note({ item, onDelete, onUpdate, onDuplicate, isHost, activeTool }) {
  const { scale } = useCanvas();
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ pointerX: 0, pointerY: 0, itemX: 0, itemY: 0 });
  
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef({ x: 0, y: 0, scale: 1 });

  const [isWidthResizing, setIsWidthResizing] = useState(false);
  const widthResizeStartRef = useRef({ x: 0, width: 0 });

  const [isEditing, setIsEditing] = useState(!item.text); // auto-edit if empty
  const [localText, setLocalText] = useState(item.text);
  const inputRef = useRef(null);

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
      onUpdate(item.id, { text: localText });
    }
  };

  // No longer using card background colors. Text nodes only.

  const handlePointerDown = (e) => {
    if (activeTool !== 'pointer' || e.button !== 0) return;
    if (e.target.tagName.toLowerCase() === 'button' || e.target.closest('button')) return;
    if (e.target.tagName.toLowerCase() === 'textarea' || e.target.tagName.toLowerCase() === 'input' || e.target.isContentEditable) return;

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
    // Base width reference. Scaling 100px of drag represents 1.0 scale growth.
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

  const handleWidthResizeDown = (e) => {
    if (activeTool !== 'pointer' || e.button !== 0) return;
    e.stopPropagation();
    setIsWidthResizing(true);
    widthResizeStartRef.current = { x: e.clientX, width: item.width || 200 };
    e.target.setPointerCapture(e.pointerId);
  };

  const handleWidthResizeMove = (e) => {
    if (!isWidthResizing) return;
    e.stopPropagation();
    const dx = e.clientX - widthResizeStartRef.current.x;
    const newWidth = Math.max(100, widthResizeStartRef.current.width + (dx / scale));
    if (onUpdate) onUpdate(item.id, { width: newWidth });
  };

  const handleWidthResizeUp = (e) => {
    if (isWidthResizing) {
      e.stopPropagation();
      setIsWidthResizing(false);
      e.target.releasePointerCapture(e.pointerId);
    }
  };

  const colors = [
    '#ffffff', '#000000', '#9ca3af', '#ef4444', '#f97316', 
    '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'
  ];

  return (
    <div
      className={`text-node ${isDragging || isResizing || isWidthResizing ? 'text-dragging' : 'text-idle'}`}
      style={{
        left: item.x,
        top: item.y,
        width: item.width || 200,
        transform: `scale(${item.scale || 1})`,
        transformOrigin: 'top left',
        zIndex: item.z_index !== undefined ? item.z_index : 2,
        transitionDuration: isDragging || isResizing || isWidthResizing ? '0ms' : '150ms'
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

      {isEditing && isHost && (
        <div style={{
          position: 'absolute', top: '-40px', left: 0, display: 'flex', gap: '4px',
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

      {isEditing ? (
        <textarea
          ref={inputRef}
          value={localText}
          onChange={(e) => setLocalText(e.target.value)}
          onBlur={handleBlur}
          onPointerDown={(e) => e.stopPropagation()}
          className="text-node-textarea"
          style={{ color: item.color || '#ffffff' }}
          placeholder="Type here..."
          autoFocus
        />
      ) : (
        <div className="text-node-display" style={{ color: item.color || '#ffffff' }}>
          {item.text || 'Double-click to type'}
        </div>
      )}

      {activeTool === 'pointer' && isHost && (
        <>
          <div 
            className="resize-handle"
            onPointerDown={handleResizeDown}
            onPointerMove={handleResizeMove}
            onPointerUp={handleResizeUp}
            onPointerCancel={handleResizeUp}
            title="Scale Text"
          />
          <div 
            className="width-resize-handle"
            onPointerDown={handleWidthResizeDown}
            onPointerMove={handleWidthResizeMove}
            onPointerUp={handleWidthResizeUp}
            onPointerCancel={handleWidthResizeUp}
            style={{
              position: 'absolute', top: 0, right: '-6px', height: '100%', width: '12px',
              cursor: 'ew-resize', zIndex: 60, opacity: 0
            }}
          />
        </>
      )}
    </div>
  );
}
