'use client';

import React, { useState, useRef, useEffect } from 'react';

export default function Canvas({ children, bgColor, onBoardClick }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Handle zooming and trackpad panning
  const handleWheel = (e) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      // Zoom
      const zoomSensitivity = 0.005;
      const zoomFactor = -e.deltaY * zoomSensitivity;
      const newScale = Math.min(Math.max(scale + zoomFactor, 0.1), 5); // limit scale 0.1x to 5x
      
      // Calculate cursor position relative to the container for zooming exactly to the cursor
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const cursorX = e.clientX - rect.left;
        const cursorY = e.clientY - rect.top;
        
        // Adjust position so the point under the cursor stays the same
        const scaleChange = newScale - scale;
        const newX = position.x - (cursorX - position.x) * (scaleChange / scale);
        const newY = position.y - (cursorY - position.y) * (scaleChange / scale);
        
        setPosition({ x: newX, y: newY });
      }
      setScale(newScale);
    } else {
      // Pan
      setPosition(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }));
    }
  };

  const handlePointerDown = (e) => {
    // Only pan on middle mouse or if spacebar is held (often expected) 
    // or if clicking on the background (not an item)
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
    isDraggingRef.current = false;
    e.target.releasePointerCapture(e.pointerId);
  };

  // Add passive event listener for wheel to prevent default behavior
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
      // Calculate coordinates relative to the canvas origin (0,0 point)
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      const canvasX = (clickX - position.x) / scale;
      const canvasY = (clickY - position.y) / scale;
      
      onBoardClick(canvasX, canvasY);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden select-none outline-none ${bgColor}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={handleBackgroundClick}
      style={{ cursor: isDraggingRef.current ? 'grabbing' : 'grab' }}
    >
      <div 
        className="absolute origin-top-left transition-transform duration-75 ease-out will-change-transform"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          width: '1px',
          height: '1px' // Act as an origin anchor
        }}
      >
        {children}
      </div>
    </div>
  );
}
