'use client';

import { useState, useRef } from 'react';
import { MousePointer2, Type, Frame, Image as ImageIcon, Video, Link as LinkIcon, Upload, Check } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export default function Toolbar({ isHost, activeTool, setActiveTool, onMediaAdd, onFileUpload }) {
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
    setActiveTool('pointer');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await onFileUpload(file, showSubMenu);
      setShowSubMenu(null);
      setActiveTool('pointer');
    } catch (error) {
      alert('File upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="toolbar-container">
      
      {/* Sub Menu Overlay */}
      {showSubMenu && (
        <div className="toolbar-submenu animate-in">
          <h3 className="toolbar-submenu-title">
            {showSubMenu === 'image' ? <ImageIcon size={16}/> : <Video size={16}/>} 
            Add {showSubMenu === 'image' ? 'Image' : 'Video'}
          </h3>
          
          <div className="spacing-y-4">
            <form onSubmit={submitUrl} className="flex-gap-2">
              <input 
                type="url" 
                placeholder="Paste URL..." 
                className="toolbar-input"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />
              <button type="submit" className="btn-primary" style={{padding: '8px 12px'}}>
                <Check size={16} />
              </button>
            </form>

            <div className="z-10" style={{borderTop: '1px solid rgba(255,255,255,0.1)', margin: '1rem 0', position: 'relative'}}>
              <div style={{position: 'absolute', top: '-0.75rem', left: '50%', transform: 'translateX(-50%)', background: 'var(--shade-admin-bg)', padding: '0 0.5rem', fontSize: '0.75rem', color: '#9ca3af'}}>
                or
              </div>
            </div>

            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="glass-panel w-full flex-center-gap"
              style={{padding: '0.5rem', fontSize: '0.875rem', border: 'none', background: 'rgba(255,255,255,0.05)', color: 'white', transition: 'background 0.2s', cursor: 'pointer', borderRadius: '8px'}}
            >
              <Upload size={16} />
              {isUploading ? 'Uploading...' : 'Upload File'}
            </button>
            <input 
              type="file" 
              style={{display: 'none'}} 
              ref={fileInputRef}
              accept={showSubMenu === 'image' ? "image/png, image/jpeg, image/jpg, image/webp" : "video/mp4, video/quicktime, video/webm"}
              onChange={handleFileChange}
            />
          </div>
        </div>
      )}

      {/* Main Toolbar */}
      <div className="toolbar-main">
        <button 
          onClick={() => handleToolClick('pointer')}
          className={`toolbar-btn ${activeTool === 'pointer' ? 'toolbar-btn-active' : ''}`}
          title="Pointer tool"
        >
          <MousePointer2 size={18} />
        </button>

        <div className="toolbar-divider"></div>

        <button 
          onClick={() => handleToolClick('note')}
          className={`toolbar-btn ${activeTool === 'note' ? 'toolbar-btn-active' : ''}`}
          title="Add Text"
        >
          <Type size={18} />
        </button>

        {isHost && (
          <button 
            onClick={() => handleToolClick('artboard')}
            className={`toolbar-btn ${activeTool === 'artboard' ? 'toolbar-btn-active' : ''}`}
            title="Add Artboard"
          >
            <Frame size={18} />
          </button>
        )}

        {isHost && (
          <>
            <button 
              onClick={() => handleToolClick('image')}
              className={`toolbar-btn ${activeTool === 'image' ? 'toolbar-btn-active' : ''}`}
              title="Add Image"
            >
              <ImageIcon size={18} />
            </button>
            <button 
              onClick={() => handleToolClick('video')}
              className={`toolbar-btn ${activeTool === 'video' ? 'toolbar-btn-active' : ''}`}
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
