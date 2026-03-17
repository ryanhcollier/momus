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
      // Instantly create a blank note that enters edit mode
      await createItem({ type: 'note', text: '', x, y });
      setActiveTool('pointer');
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

  const handleUpdateItem = async (itemId, updates) => {
    // Optimistic UI update
    setItems((prev) => prev.map(item => item.id === itemId ? { ...item, ...updates } : item));

    try {
      await fetch(`/api/boards/${id}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.error('Error updating item', err);
      // Let poll correct it on next tick if failed
    }
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
      <div className="min-h-screen flex items-center justify-center bg-shade-5 text-gray-800">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center gap-4 animate-in">
          <div className="w-10 h-10 border-4 border-gray-100 border-t-primary rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Loading Workspace...</p>
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
                onUpdate={handleUpdateItem}
                activeTool={activeTool}
              />
            );
          } else {
            return (
              <MediaItem 
                key={item.id} 
                item={item} 
                isHost={isHost} 
                onDelete={handleDeleteItem} 
                onUpdate={handleUpdateItem}
                activeTool={activeTool}
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
      <div className="fixed top-6 left-6 z-50 bg-white rounded-lg px-4 py-3 pointer-events-none shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 drop-shadow-sm tracking-tight">{board.title}</h2>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.4)] animate-pulse" />
          <p className="text-xs font-mono text-gray-500">Live Session &middot; ID: {board.id}</p>
        </div>
      </div>

      {activeTool === 'note' && (
        <div className="fixed top-6 right-6 z-50 bg-blue-50 rounded-lg border border-blue-200 text-blue-800 px-4 py-2 animate-in pointer-events-none shadow-sm">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
            <span className="text-sm font-medium">Click anywhere to place a note</span>
          </div>
        </div>
      )}
    </div>
  );
}
