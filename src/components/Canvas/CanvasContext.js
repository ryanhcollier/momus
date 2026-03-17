'use client';

import { createContext, useContext } from 'react';

export const CanvasContext = createContext({
  scale: 1,
  position: { x: 0, y: 0 },
});

export const useCanvas = () => useContext(CanvasContext);
