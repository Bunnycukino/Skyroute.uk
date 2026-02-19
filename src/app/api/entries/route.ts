import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

// Auth check helper
function getUser(req: NextRequest): string | null {
  const cookie = req.cookies.get('skyroute_user');
  return cookie ? cookie.value : null;
}

// GET /api/entries - list entries with optional filters
export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const type = searchParams.get('type'); // 'c209' | 'c208' | null
    const search = searchParams.get('search') || '';

    // Ensure the table exists
    await sql`
      CREATE TABLE IF NOT EXISTS entries (
        id SERIAL PRIMARY KEY,
        type VARCHAR(10) NOT NULL DEFAULT 'c209',
        flight_number VARCHAR(20),
        container_code VARCHAR(50),
        c209_number VARCHAR(50),
        c208_number VARCHAR(50),
        origin VARCHAR(10),
        destination VARCHAR(10),
        pieces INTEGER DEFAULT 0,
        weight NUMERIC(10,2) DEFAULT 0,
        status VARCHAR(20) DEFAULT 'active',
        notes TEXT,
        created_by VARCHAR(50),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        expires_at TIMESTAMPTZ
      )
    `;

    let entries;
    if (type && search) {
      entries = await sql`
        SELECT * FROM entries
        WHERE type = ${type}
          AND (flight_number ILIKE ${'%' + search + '%'}
            OR container_code ILIKE ${'%' + search + '%'}
            OR c209_number ILIKE ${'%' + search + '%'}
            OR c208_number ILIKE ${'%' + search + '%'})
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    } else if (type) {
      entries = await sql`
        SELECT * FROM entries
        WHERE type = ${type}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    } else if (search) {
      entries = await sql`
        SELECT * FROM entries
        WHERE flight_number ILIKE ${'%' + search + '%'}
          OR container_code ILIKE ${'%' + search + '%'}
          OR c209_number ILIKE ${'%' + search + '%'}
          OR c208_number ILIKE ${'%' + search + '%'}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    } else {
      entries = await sql`
        SELECT * FROM entries
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    }

    // Stats
    const statsResult = await sql`
      SELECT
        COUNT(*) AS total_entries,
        COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) AS today_entries,
        COUNT(*) FILTER (WHERE expires_at IS NOT NULL AND expires_at < NOW() + INTERVAL '24 hours' AND expires_at > NOW()) AS expiring_soon,
        COUNT(DISTINCT flight_number) FILTER (WHERE flight_number IS NOT NULL) AS total_flights
      FROM entries
    `;

    const stats = statsResult[0] || {};

    return NextResponse.json({
      entries,
      stats: {
        totalEntries: Number(stats.total_entries) || 0,
        todayEntries: Number(stats.today_entries) || 0,
        expiringSoon: Number(stats.expiring_soon) || 0,
        totalFlights: Number(stats.total_flights) || 0,
      },
    });
  } catch (error) {
    console.error('GET /api/entries error:', error);
    return NextResponse.json(
      { error: 'Database error', entries: [], stats: { totalEntries: 0, todayEntries: 0, expiringSoon: 0, totalFlights: 0 } },
      { status: 500 }
    );
  }
}

// POST /api/entries - create a new entry
export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      type = 'c209',
      flight_number,
      container_code,
      c209_number,
      c208_number,
      origin,
      destination,
      pieces = 0,
      weight = 0,
      status = 'active',
      notes,
      expires_at,
    } = body;

    const result = await sql`
      INSERT INTO entries (
        type, flight_number, container_code, c209_number, c208_number,
        origin, destination, pieces, weight, status, notes, created_by, expires_at
      ) VALUES (
        ${type}, ${flight_number || null}, ${container_code || null},
        ${c209_number || null}, ${c208_number || null},
        ${origin || null}, ${destination || null},
        ${pieces}, ${weight}, ${status}, ${notes || null},
        ${user}, ${expires_at || null}
      )
      RETURNING *
    `;

    return NextResponse.json({ entry: result[0] }, { status: 201 });
  } catch (error) {
    console.error('POST /api/entries error:', error);
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
  }
}

// DELETE /api/entries?id=123
export async function DELETE(req: NextRequest) {
  const user = getUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Entry ID required' }, { status: 400 });
    }

    await sql`DELETE FROM entries WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/entries error:', error);
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
  }
}
