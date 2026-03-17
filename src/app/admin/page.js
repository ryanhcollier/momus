'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Trash2, ExternalLink } from 'lucide-react';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [boards, setBoards] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newColor, setNewColor] = useState('bg-shade-5');

  const bgOptions = [
    { value: 'bg-shade-1', label: 'White' },
    { value: 'bg-shade-2', label: 'Light Grey' },
    { value: 'bg-shade-3', label: 'Mid Grey' },
    { value: 'bg-shade-4', label: 'Dark Grey' },
    { value: 'bg-shade-5', label: 'Black' },
  ];

  useEffect(() => {
    // Check if previously authenticated
    if (localStorage.getItem('hostAuth') === 'true') {
      setIsAuthenticated(true);
      fetchBoards();
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    // Simple password check (replace with real env variable check in a real app if desired)
    if (password === 'host123') {
      localStorage.setItem('hostAuth', 'true');
      setIsAuthenticated(true);
      fetchBoards();
    } else {
      alert('Incorrect password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('hostAuth');
    setIsAuthenticated(false);
    setBoards([]);
  };

  const fetchBoards = async () => {
    try {
      const res = await fetch('/api/boards');
      if (res.ok) {
        const data = await res.json();
        setBoards(data);
      }
    } catch (error) {
      console.error('Error fetching boards', error);
    }
  };

  const createBoard = async (e) => {
    e.preventDefault();
    if (!newTitle) return;

    try {
      const res = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, bgColor: newColor }),
      });
      if (res.ok) {
        setNewTitle('');
        setNewColor('bg-shade-5');
        fetchBoards();
      }
    } catch (error) {
      console.error('Error creating board', error);
    }
  };

  const deleteBoard = async (id) => {
    if (!confirm('Are you sure you want to delete this board?')) return;
    try {
      const res = await fetch(`/api/boards/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchBoards();
      }
    } catch (error) {
      console.error('Error deleting board', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-shade-5 text-white">
        <div className="glass-panel p-8 w-full max-w-md animate-in">
          <h1 className="text-3xl font-bold mb-6 text-center">Host Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Enter Host Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              Access Dashboard
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-400">Password is 'host123'</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-shade-5 text-white p-8">
      <div className="max-w-5xl mx-auto animate-in space-y-8">
        <div className="flex justify-between items-center bg-shade-4 p-6 rounded-2xl border border-gray-700">
          <div>
            <h1 className="text-3xl font-bold">Host Dashboard</h1>
            <p className="text-gray-400 mt-1">Manage your collaborative boards</p>
          </div>
          <button onClick={handleLogout} className="btn-primary bg-danger hover:bg-red-600">
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Create Board Form */}
          <div className="glass-panel p-6 h-fit md:col-span-1">
            <h2 className="text-xl font-semibold mb-4">Create New Board</h2>
            <form onSubmit={createBoard} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Board Title</label>
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
                <label className="block text-sm font-medium mb-2 text-gray-300">Background Color</label>
                <div className="flex gap-2">
                  {bgOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setNewColor(opt.value)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${opt.value} ${newColor === opt.value ? 'border-primary scale-110' : 'border-transparent hover:scale-105'}`}
                      title={opt.label}
                    />
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-primary w-full flex justify-center items-center gap-2 mt-4">
                <Plus size={18} /> Create Board
              </button>
            </form>
          </div>

          {/* Board List */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold">Your Boards</h2>
            {boards.length === 0 ? (
              <div className="text-gray-400 border border-dashed border-gray-700 rounded-xl p-8 text-center">
                No boards created yet. Create one to get started!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {boards.map((board) => (
                  <div key={board.id} className="glass-panel p-5 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div>
                        <h3 className="text-lg font-bold">{board.title}</h3>
                        <p className="text-xs text-gray-400">ID: {board.id}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border border-gray-600 ${board.bg_color}`} title="Background Color" />
                    </div>
                    
                    <div className="flex gap-2 relative z-10 mt-4">
                      <Link href={`/board/${board.id}`} className="btn-primary flex-1 flex justify-center items-center gap-2 text-sm !py-2">
                        <ExternalLink size={16} /> Open Host View
                      </Link>
                      <button onClick={() => deleteBoard(board.id)} className="btn-icon bg-red-500/10 text-red-500 hover:bg-red-500/20">
                        <Trash2 size={18} />
                      </button>
                    </div>
                    
                    {/* Share Link Helper */}
                    <div className="mt-4 pt-4 border-t border-gray-700/50 relative z-10">
                      <label className="text-xs text-gray-400 mb-1 block">Share link for Viewers:</label>
                      <input 
                        readOnly 
                        value={`${typeof window !== 'undefined' ? window.location.origin : ''}/board/${board.id}`}
                        className="w-full bg-black/50 border border-gray-700 rounded p-1.5 text-xs text-gray-300 select-all outline-none"
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
