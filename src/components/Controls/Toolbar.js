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
      <div className="bg-white rounded-xl px-2 py-1.5 flex items-center gap-1 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 mb-6">
        <button 
          onClick={() => handleToolClick('pointer')}
          className={`btn-icon !w-10 !h-10 ${activeTool === 'pointer' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
          title="Pointer tool"
        >
          <MousePointer2 size={18} />
        </button>

        <div className="w-px h-5 bg-gray-200 mx-1"></div>

        <button 
          onClick={() => handleToolClick('note')}
          className={`btn-icon !w-10 !h-10 ${activeTool === 'note' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
          title="Add Sticky Note"
        >
          <StickyNote size={18} />
        </button>

        {isHost && (
          <>
            <button 
              onClick={() => handleToolClick('image')}
              className={`btn-icon !w-10 !h-10 ${activeTool === 'image' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
              title="Add Image"
            >
              <ImageIcon size={18} />
            </button>
            <button 
              onClick={() => handleToolClick('video')}
              className={`btn-icon !w-10 !h-10 ${activeTool === 'video' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
              title="Add Video"
            >
              <Video size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
