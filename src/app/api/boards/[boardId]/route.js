import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { boardId } = await params;
    
    const board = db.prepare('SELECT * FROM boards WHERE id = ?').get(boardId);
    
    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    return NextResponse.json(board);
  } catch (error) {
    console.error('Failed to fetch board:', error);
    return NextResponse.json({ error: 'Failed to fetch board' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { boardId } = await params;
    
    // SQLite ON DELETE CASCADE handles deleting the items
    const info = db.prepare('DELETE FROM boards WHERE id = ?').run(boardId);
    
    if (info.changes === 0) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete board:', error);
    return NextResponse.json({ error: 'Failed to delete board' }, { status: 500 });
  }
}
