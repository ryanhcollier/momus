'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

export default function HostDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newColor, setNewColor] = useState('bg-shade-5');
  const [deletingId, setDeletingId] = useState(null);

  // Convex Queries & Mutations
  const boards = useQuery(api.boards.getBoards) || [];
  const createBoardMutation = useMutation(api.boards.createBoard);
  const deleteBoardMutation = useMutation(api.boards.deleteBoard);

  const bgOptions = [
    { value: 'bg-shade-1', label: 'White' },
    { value: 'bg-shade-2', label: 'Light Grey' },
    { value: 'bg-shade-3', label: 'Mid Grey' },
    { value: 'bg-shade-4', label: 'Dark Grey' },
    { value: 'bg-shade-5', label: 'Black' },
  ];

  useEffect(() => {
    if (localStorage.getItem('hostAuth') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'host123') {
      localStorage.setItem('hostAuth', 'true');
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('hostAuth');
    setIsAuthenticated(false);
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newTitle) return;

    try {
      await createBoardMutation({ title: newTitle, bgColor: newColor });
      setNewTitle('');
      setNewColor('bg-shade-5');
    } catch (error) {
      console.error('Error creating board', error);
    }
  };

  const handleDeleteBoard = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (deletingId !== id) {
      setDeletingId(id);
      return;
    }

    setDeletingId(null);
    
    try {
      await deleteBoardMutation({ id });
    } catch (error) {
      console.error('Error deleting board', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-layout">
        <div className="decorator decorator-1 animate-float" />
        <div className="decorator decorator-2 animate-float-delayed" />
        
        <div className="glass-panel login-card animate-in z-10">
          <div className="login-icon-wrap">
            <div className="login-icon">
              <ExternalLink size={28} />
            </div>
          </div>
          <h1 className="login-title">Host Login</h1>
          <form onSubmit={handleLogin} className="spacing-y-5">
            <div>
              <input
                type="password"
                placeholder="Enter Host Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field py-3"
              />
            </div>
            <button type="submit" className="btn-primary w-full py-3">
              Access Dashboard
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500 font-medium">Password is 'host123'</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout-dashboard">
      <div className="decorator decorator-3 animate-float" />
      <div className="decorator decorator-4 animate-float-delayed" />
      
      <div className="dashboard-max-width animate-in spacing-y-10 z-10">
        <div className="dashboard-header glass-panel">
          <div>
            <h1 className="dashboard-title">Host Dashboard</h1>
            <p className="dashboard-subtitle">Manage your real-time collaborative boards</p>
          </div>
          <button onClick={handleLogout} className="btn-primary btn-danger">
            Logout
          </button>
        </div>

        <div className="dashboard-grid">
          <div className="glass-panel create-board-card col-span-1 border-white/10">
            <div className="decorator-small" />
            
            <h2 className="card-title">Create New Board</h2>
            <form onSubmit={handleCreateBoard} className="spacing-y-5">
              <div>
                <label className="form-label">Board Title</label>
                <input
                  type="text"
                  placeholder="e.g. Client Review Session"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label className="form-label">Background Color</label>
                <div className="flex-gap-2">
                  {bgOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setNewColor(opt.value)}
                      className={`color-picker-btn ${opt.value} ${newColor === opt.value ? 'color-picker-active' : ''}`}
                      title={opt.label}
                    />
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-primary w-full flex-center-gap mt-4">
                <Plus size={18} /> Create Board
              </button>
            </form>
          </div>

          <div className="col-span-2 spacing-y-4">
            <h2 className="text-xl font-semibold">Your Boards</h2>
            {boards.length === 0 ? (
              <div className="empty-state">
                No boards created yet. Create one to get started!
              </div>
            ) : (
              <div className="boards-list-grid">
                {boards.map((board) => (
                  <div key={board._id} className="glass-panel board-card group">
                    <div className="flex-between-start">
                      <div>
                        <h3 className="text-lg font-bold">{board.title}</h3>
                        <p className="text-xs text-gray-400">ID: {board._id}</p>
                      </div>
                      <div className={`color-swatch ${board.bg_color}`} title="Background Color" />
                    </div>
                    
                    <div className="flex-gap-2 z-10 mt-4">
                      {/* Notice this links directly to /board?id= corresponding to reil.studio/momus/board?id= */}
                      <Link href={`/board?id=${board._id}`} className="btn-primary flex-1 flex-center-gap text-sm py-2">
                        <ExternalLink size={16} /> Open Board
                      </Link>
                      <button 
                        type="button" 
                        onClick={(e) => handleDeleteBoard(e, board._id)} 
                        onMouseLeave={() => setDeletingId(null)}
                        className="btn-icon-danger"
                        style={{ width: deletingId === board._id ? 'auto' : '40px', padding: deletingId === board._id ? '0 12px' : '0' }}
                      >
                        <Trash2 size={18} />
                        {deletingId === board._id && <span className="text-xs font-bold ml-1">Confirm</span>}
                      </button>
                    </div>
                    
                    <div className="share-link-wrapper">
                      <label className="form-label" style={{marginBottom: '4px', fontSize: '10px'}}>Share link for Viewers:</label>
                      <input 
                        readOnly 
                        value={`${typeof window !== 'undefined' ? window.location.origin : ''}/momus/board?id=${board._id}`}
                        className="share-link-input"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
