import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const boards = db.prepare('SELECT * FROM boards ORDER BY created_at DESC').all();
    return NextResponse.json(boards);
  } catch (error) {
    console.error('Failed to fetch boards:', error);
    return NextResponse.json({ error: 'Failed to fetch boards' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, bgColor } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    const stmt = db.prepare('INSERT INTO boards (id, title, bg_color) VALUES (?, ?, ?)');
    stmt.run(id, title, bgColor || 'bg-shade-5');

    const newBoard = db.prepare('SELECT * FROM boards WHERE id = ?').get(id);

    return NextResponse.json(newBoard, { status: 201 });
  } catch (error) {
    console.error('Failed to create board:', error);
    return NextResponse.json({ error: 'Failed to create board' }, { status: 500 });
  }
}
