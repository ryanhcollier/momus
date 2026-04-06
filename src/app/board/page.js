'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import Canvas from '@/components/Canvas/Canvas';
import StickyNote from '@/components/Items/StickyNote';
import MediaItem from '@/components/Items/MediaItem';
import ArtboardItem from '@/components/Items/ArtboardItem';
import Toolbar from '@/components/Controls/Toolbar';

function BoardContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();

  const [isHost, setIsHost] = useState(false);
  const [activeTool, setActiveTool] = useState('pointer'); // 'pointer', 'note', 'image', 'video'

  // Convex Subscriptions & Mutations
  const board = useQuery(api.boards.getBoard, { id });
  const items = useQuery(api.items.getItems, { boardId: id });
  
  const addItemMutation = useMutation(api.items.addItem);
  const updateItemMutation = useMutation(api.items.updateItem);
  const deleteItemMutation = useMutation(api.items.deleteItem);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsHost(localStorage.getItem('hostAuth') === 'true');
    }
  }, []);

  // Handle Board Loading State
  if (board === undefined || items === undefined) {
    return (
      <div className="loading-screen">
        <div className="loading-card animate-in">
          <div className="spinner" />
          <p className="font-medium text-gray-500">Loading Workspace...</p>
        </div>
      </div>
    );
  }

  // Handle Board Missing
  if (board === null) {
    if (typeof window !== 'undefined') router.push('/momus');
    return null;
  }

  const handleBoardClick = async (x, y) => {
    if (activeTool === 'note') {
      // Create empty note (server will instantly stream it back to all views)
      await addItemMutation({
        boardId: id,
        type: 'note',
        content: '',
        x,
        y,
        zIndex: 2,
        color: 'bg-yellow-100', // default sticky color
      });
      setActiveTool('pointer');
    } else if (activeTool === 'artboard') {
      await addItemMutation({
        boardId: id,
        type: 'artboard',
        content: 'Artboard',
        x,
        y,
        zIndex: 1, // Underneath everything
      });
      setActiveTool('pointer');
    }
  };

  const handleMediaAdd = async (type, url) => {
    await addItemMutation({
      boardId: id,
      type,
      content: url, // For media, 'content' is the URL
      x: 0,
      y: 0,
      zIndex: 2,
    });
    setActiveTool('pointer');
  };

  const handleUpdateItem = async (itemId, updates) => {
    // Map existing SQLite keys like z_index to zIndex if passed from legacy components
    const mappedUpdates = { ...updates };
    if (mappedUpdates.z_index !== undefined) {
      mappedUpdates.zIndex = mappedUpdates.z_index;
      delete mappedUpdates.z_index;
    }
    if (mappedUpdates.url !== undefined) {
      mappedUpdates.content = mappedUpdates.url;
      delete mappedUpdates.url;
    }
    if (mappedUpdates.text !== undefined) {
      mappedUpdates.content = mappedUpdates.text;
      delete mappedUpdates.text;
    }

    try {
      await updateItemMutation({
        id: itemId,
        ...mappedUpdates,
      });
    } catch (err) {
      console.error('Error updating item', err);
    }
  };

  const handleDuplicateItem = async (item) => {
    try {
      const newItem = {
        boardId: id,
        type: item.type,
        content: item.content,
        x: item.x + 0.1, // very slight offset to prevent strict identical DOM overlay bugs if any
        y: item.y + 0.1,
        zIndex: item.z_index || (item.type === 'artboard' ? 1 : 2),
      };
      
      if (item.color !== undefined) newItem.color = item.color;
      if (item.scale !== undefined) newItem.scale = item.scale;
      
      await addItemMutation(newItem);
    } catch (err) {
      console.error('Error duplicating item', err);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await deleteItemMutation({ id: itemId });
    } catch (err) {
      console.error('Error deleting item', err);
    }
  };

  // Convert old DB formats to standardized generic props locally for the components
  const normalizedItems = items.map(item => ({
    ...item,
    id: item._id, // map Convex _id to id so legacy components don't break
    text: item.type === 'note' ? item.content : undefined,
    url: item.type !== 'note' ? item.content : undefined,
    z_index: item.z_index,
  }));

  return (
    <div className={`board-layout ${board.bg_color}`}>
      <Canvas bgColor={board.bg_color} onBoardClick={handleBoardClick}>
        {normalizedItems.map((item) => {
          if (item.type === 'note') {
            return (
              <StickyNote 
                key={item.id} 
                item={item} 
                isHost={isHost} 
                onDelete={handleDeleteItem} 
                onUpdate={handleUpdateItem}
                onDuplicate={handleDuplicateItem}
                activeTool={activeTool}
              />
            );
          } else if (item.type === 'artboard') {
            return (
              <ArtboardItem 
                key={item.id} 
                item={item} 
                allItems={normalizedItems}
                isHost={isHost} 
                onDelete={handleDeleteItem} 
                onUpdate={handleUpdateItem}
                onDuplicate={handleDuplicateItem}
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
                onDuplicate={handleDuplicateItem}
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
      
      <div className="board-topbar-clean">
        <h2 className={`board-title-clean ${
          board.bg_color === 'bg-shade-4' || board.bg_color === 'bg-shade-5' 
            ? 'text-inverted-light' 
            : 'text-inverted-dark'
        }`}>
          {board.title}
        </h2>
      </div>

      {activeTool === 'note' && (
        <div className="tool-tip animate-in">
          <div className="flex-center-gap">
            <span className="radar-blip">
              <span className="ping"></span>
              <span className="dot"></span>
            </span>
            <span className="text-sm font-medium">Click anywhere to place a note</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BoardPage() {
  return (
    <Suspense fallback={<div className="loading-screen"><div className="spinner" /></div>}>
      <BoardContent />
    </Suspense>
  );
}
