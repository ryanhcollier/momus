'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import Canvas from '@/components/Canvas/Canvas';
import StickyNote from '@/components/Items/StickyNote';
import MediaItem from '@/components/Items/MediaItem';
import Toolbar from '@/components/Controls/Toolbar';

export default function BoardPage({ params }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  const router = useRouter();

  const [board, setBoard] = useState(null);
  const [items, setItems] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [activeTool, setActiveTool] = useState('pointer'); // 'pointer', 'note', 'image', 'video'
  const [isLoading, setIsLoading] = useState(true);

  // Initial load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsHost(localStorage.getItem('hostAuth') === 'true');
    }

    const loadBoard = async () => {
      try {
        const res = await fetch(`/api/boards/${id}`);
        if (!res.ok) {
          router.push('/admin'); // board not found, redirect to admin
          return;
        }
        const boardData = await res.json();
        setBoard(boardData);
      } catch (err) {
        console.error(err);
      }
    };

    loadBoard();
  }, [id, router]);

  // Polling for items
  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch(`/api/boards/${id}/items`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchItems();
    const interval = setInterval(fetchItems, 3000); // Poll every 3 seconds for collaborative feel
    return () => clearInterval(interval);
  }, [fetchItems]);

  const handleBoardClick = async (x, y) => {
    if (activeTool === 'note') {
      // Add sticky note
      const text = prompt('Enter your note:');
      if (text) {
        await createItem({ type: 'note', text, x, y });
        // Reset tool to pointer after placing note
        setActiveTool('pointer');
      }
    }
  };

  const createItem = async (itemData) => {
    try {
      const res = await fetch(`/api/boards/${id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });
      if (res.ok) {
        fetchItems(); // refresh instantly
      }
    } catch (err) {
      console.error('Error adding item', err);
    }
  };

  const handleMediaAdd = async (type, url) => {
    // Add media at the origin (0,0) or center for simplicity
    await createItem({ type, url, x: 0, y: 0 });
    setActiveTool('pointer');
  };

  const handleDeleteItem = async (itemId) => {
    try {
      const res = await fetch(`/api/boards/${id}/items/${itemId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchItems();
      }
    } catch (err) {
      console.error('Error deleting item', err);
    }
  };

  if (isLoading || !board) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-shade-5 text-white">
        <div className="animate-pulse flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-primary" />
          <div className="w-4 h-4 rounded-full bg-primary/70" />
          <div className="w-4 h-4 rounded-full bg-primary/40" />
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 overflow-hidden ${board.bg_color}`}>
      <Canvas bgColor={board.bg_color} onBoardClick={handleBoardClick}>
        {items.map((item) => {
          if (item.type === 'note') {
            return (
              <StickyNote 
                key={item.id} 
                item={item} 
                isHost={isHost} 
                onDelete={handleDeleteItem} 
              />
            );
          } else {
            return (
              <MediaItem 
                key={item.id} 
                item={item} 
                isHost={isHost} 
                onDelete={handleDeleteItem} 
              />
            );
          }
        })}
      </Canvas>

      <Toolbar 
        isHost={isHost} 
        activeTool={activeTool} 
        setActiveTool={setActiveTool} 
        onMediaAdd={handleMediaAdd} 
      />
      
      {/* Board Info overlay */}
      <div className="fixed top-4 left-4 z-50 glass-panel px-4 py-2 pointer-events-none">
        <h2 className="text-xl font-bold text-white drop-shadow-md">{board.title}</h2>
        <p className="text-xs text-white/70">ID: {board.id}</p>
      </div>

      {activeTool === 'note' && (
        <div className="fixed top-4 right-4 z-50 glass-panel bg-primary/20 border-primary/50 text-primary px-4 py-2 animate-in pointer-events-none">
          Click anywhere to place a note
        </div>
      )}
    </div>
  );
}
