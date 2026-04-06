'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CanvasContext } from './CanvasContext';

export default function Canvas({ children, bgColor, onBoardClick }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomSensitivity = 0.002;
    const zoomFactor = -e.deltaY * zoomSensitivity;
    const newScale = Math.min(Math.max(scale + zoomFactor, 0.1), 5);
    
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;
      
      const scaleChange = newScale - scale;
      const newX = position.x - (cursorX - position.x) * (scaleChange / scale);
      const newY = position.y - (cursorY - position.y) * (scaleChange / scale);
      
      setPosition({ x: newX, y: newY });
    }
    setScale(newScale);
  };

  const handlePointerDown = (e) => {
    if (e.target === containerRef.current || e.button === 1) {
      isDraggingRef.current = true;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      e.target.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e) => {
    if (isDraggingRef.current) {
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      
      setPosition(prev => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));
      
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePointerUp = (e) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      e.target.releasePointerCapture(e.pointerId);
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      const onWheel = (e) => handleWheel(e);
      el.addEventListener('wheel', onWheel, { passive: false });
      return () => el.removeEventListener('wheel', onWheel);
    }
  }, [scale, position]);

  const handleBackgroundClick = (e) => {
    if (e.target === containerRef.current && onBoardClick) {
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      const canvasX = (clickX - position.x) / scale;
      const canvasY = (clickY - position.y) / scale;
      
      onBoardClick(canvasX, canvasY);
    }
  };

  const gridSize = 14; 
  const dotSize = 1;

  // Add the provided background color class if needed, or default. 
  // We'll let the layout handle the bg_color, and here we just act as container.

  return (
    <div 
      ref={containerRef}
      className="canvas-container"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={handleBackgroundClick}
      style={{ 
        cursor: isDraggingRef.current ? 'grabbing' : 'auto',
        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.08) ${dotSize}px, transparent ${dotSize}px)`,
        backgroundSize: `${gridSize}px ${gridSize}px`,
        backgroundPosition: `${position.x}px ${position.y}px`,
      }}
    >
      <CanvasContext.Provider value={{ scale, position }}>
        <div 
          className="canvas-inner"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            width: '1px',
            height: '1px'
          }}
        >
          {children}
        </div>
      </CanvasContext.Provider>
    </div>
  );
}
