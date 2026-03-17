import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function DELETE(request, { params }) {
  try {
    const { itemId } = await params;
    
    const info = db.prepare('DELETE FROM items WHERE id = ?').run(itemId);
    
    if (info.changes === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete item:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { itemId } = await params;
    const body = await request.json();
    
    // We only support patching x, y, width, height for now
    const updates = [];
    const values = [];
    
    if (body.x !== undefined) {
      updates.push('x = ?');
      values.push(body.x);
    }
    if (body.y !== undefined) {
      updates.push('y = ?');
      values.push(body.y);
    }
    if (body.width !== undefined) {
      updates.push('width = ?');
      values.push(body.width);
    }
    if (body.height !== undefined) {
      updates.push('height = ?');
      values.push(body.height);
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: true }); // Nothing to update
    }

    values.push(itemId); // For WHERE clause

    const query = `UPDATE items SET ${updates.join(', ')} WHERE id = ?`;
    const info = db.prepare(query).run(...values);

    if (info.changes === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update item:', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}
