import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { boardId } = await params;
    
    const items = db.prepare('SELECT * FROM items WHERE board_id = ?').all(boardId);
    
    return NextResponse.json(items);
  } catch (error) {
    console.error('Failed to fetch items:', error);
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { boardId } = await params;
    const body = await request.json();
    
    const { type, url, text, x, y, width, height } = body;

    if (!type || !['image', 'video', 'note'].includes(type) || x === undefined || y === undefined) {
      return NextResponse.json({ error: 'Invalid item data' }, { status: 400 });
    }

    const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    const stmt = db.prepare(`
      INSERT INTO items (id, board_id, type, url, text, x, y, width, height) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, boardId, type, url || null, text || null, x, y, width || null, height || null);

    const newItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Failed to create item:', error);
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}
