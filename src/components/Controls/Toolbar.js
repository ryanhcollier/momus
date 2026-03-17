'use client';

import { useState, useRef } from 'react';
import { MousePointer2, StickyNote, Image as ImageIcon, Video, Link as LinkIcon, Upload, Check } from 'lucide-react';

export default function Toolbar({ isHost, activeTool, setActiveTool, onMediaAdd }) {
  const [showSubMenu, setShowSubMenu] = useState(null); // 'image' or 'video'
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleToolClick = (tool) => {
    setActiveTool(tool);
    if (tool === 'image' || tool === 'video') {
      setShowSubMenu(tool);
    } else {
      setShowSubMenu(null);
    }
  };

  const submitUrl = (e) => {
    e.preventDefault();
    if (!urlInput) return;
    onMediaAdd(showSubMenu, urlInput);
    setUrlInput('');
    setShowSubMenu(null);
    setActiveTool('pointer'); // revert to pointer to let them drag it or click it
    // Actually, media items show up at (0,0) or center. Let's make them appear at board origin (0,0)
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (res.ok) {
        const data = await res.json();
        onMediaAdd(showSubMenu, data.url);
        setShowSubMenu(null);
        setActiveTool('pointer');
      } else {
        alert('File upload failed');
      }
    } catch (error) {
      console.error(error);
      alert('File upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4">
      
      {/* Sub Menu Overlay */}
      {showSubMenu && (
        <div className="glass-panel p-4 animate-in w-80 text-white border-white/20">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            {showSubMenu === 'image' ? <ImageIcon size={16}/> : <Video size={16}/>} 
            Add {showSubMenu === 'image' ? 'Image' : 'Video'}
          </h3>
          
          <div className="space-y-4">
            <form onSubmit={submitUrl} className="flex gap-2">
              <input 
                type="url" 
                placeholder="Paste URL..." 
                className="input-field py-2 text-sm flex-1 bg-white/10"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />
              <button type="submit" className="bg-primary hover:bg-primary-hover px-3 rounded-lg flex items-center justify-center">
                <Check size={16} />
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-transparent px-2 text-gray-400">or</span>
              </div>
            </div>

            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full glass-panel py-2 text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
            >
              <Upload size={16} />
              {isUploading ? 'Uploading...' : 'Upload File'}
            </button>
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef}
              accept={showSubMenu === 'image' ? "image/png, image/jpeg, image/jpg" : "video/mp4, video/quicktime"}
              onChange={handleFileUpload}
            />
          </div>
        </div>
      )}

      {/* Main Toolbar */}
      <div className="glass-panel p-2 flex items-center gap-2 ring-1 ring-white/10">
        <button 
          onClick={() => handleToolClick('pointer')}
          className={`btn-icon ${activeTool === 'pointer' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
          title="Pointer tool"
        >
          <MousePointer2 size={20} />
        </button>

        <div className="w-px h-8 bg-white/10 mx-1"></div>

        <button 
          onClick={() => handleToolClick('note')}
          className={`btn-icon ${activeTool === 'note' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
          title="Add Sticky Note"
        >
          <StickyNote size={20} />
        </button>

        {isHost && (
          <>
            <button 
              onClick={() => handleToolClick('image')}
              className={`btn-icon ${activeTool === 'image' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
              title="Add Image"
            >
              <ImageIcon size={20} />
            </button>
            <button 
              onClick={() => handleToolClick('video')}
              className={`btn-icon ${activeTool === 'video' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
              title="Add Video"
            >
              <Video size={20} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
