export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

function getUser(req: NextRequest): string | null {
  const cookie = req.cookies.get('skyroute_user');
  return cookie ? cookie.value : null;
}

function getMonthPrefix(date: Date) {
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  return months[date.getMonth()];
}

async function getNextSequence(type: 'c209' | 'c208', date: Date) {
  const prefix = getMonthPrefix(date);
  const pattern = prefix + '%';
  const col = type === 'c209' ? 'c209_number' : 'c208_number';
  const result = await sql.unsafe(
    `SELECT ${col} as val FROM entries WHERE ${col} LIKE $1 ORDER BY ${col} DESC LIMIT 1`,
    [pattern]
  );
  if (result.length === 0) return 1;
  const lastVal = result[0].val as string;
  const numPart = parseInt(lastVal.substring(3));
  return isNaN(numPart) ? 1 : numPart + 1;
}

export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const type = searchParams.get('type');
    const search = searchParams.get('search') || '';

    let entries;
    if (type && search) {
      entries = await sql.unsafe(
        `SELECT * FROM entries WHERE type = $1 AND (c209_number ILIKE $2 OR c208_number ILIKE $2 OR flight_number ILIKE $2 OR container_code ILIKE $2 OR bar_number ILIKE $2) ORDER BY created_at DESC LIMIT $3`,
        [type, '%' + search + '%', limit]
      );
    } else if (type) {
      entries = await sql.unsafe(
        `SELECT * FROM entries WHERE type = $1 ORDER BY created_at DESC LIMIT $2`,
        [type, limit]
      );
    } else if (search) {
      entries = await sql.unsafe(
        `SELECT * FROM entries WHERE c209_number ILIKE $1 OR c208_number ILIKE $1 OR flight_number ILIKE $1 OR container_code ILIKE $1 OR bar_number ILIKE $1 ORDER BY created_at DESC LIMIT $2`,
        ['%' + search + '%', limit]
      );
    } else {
      entries = await sql.unsafe(
        `SELECT * FROM entries ORDER BY created_at DESC LIMIT $1`,
        [limit]
      );
    }

    const totalResult = await sql`SELECT COUNT(*) as count FROM entries`;
    const todayResult = await sql`SELECT COUNT(*) as count FROM entries WHERE created_at::date = CURRENT_DATE`;
    const expiryResult = await sql`SELECT COUNT(*) as count FROM entries WHERE type = 'logistic_input' AND created_at > NOW() - INTERVAL '48 hours' AND created_at < NOW() - INTERVAL '44 hours'`;
    const flightsResult = await sql`SELECT COUNT(DISTINCT flight_number) as count FROM entries WHERE created_at::date = CURRENT_DATE AND flight_number IS NOT NULL AND flight_number != ''`;

    const stats = {
      totalEntries: parseInt(totalResult[0].count),
      todayEntries: parseInt(todayResult[0].count),
      expiringSoon: parseInt(expiryResult[0].count),
      totalFlights: parseInt(flightsResult[0].count)
    };

    return NextResponse.json({ entries, stats });
  } catch (err: any) {
    console.error('GET /api/entries error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { action } = body;
    const now = new Date();
    const monthYear = getMonthPrefix(now) + now.getFullYear().toString().slice(2);

    if (action === 'ramp_input') {
      const seq = await getNextSequence('c209', now);
      const c209 = `${getMonthPrefix(now)}${String(seq).padStart(4, '0')}`;

      const result = await sql`
        INSERT INTO entries (
          type, c209_number, bar_number, container_code, flight_number,
          origin, destination, pieces, signature, notes, month_year, created_by
        ) VALUES (
          'ramp_input', ${c209}, ${body.container_code || null}, ${body.container_code || null},
          ${body.flight_number || null}, ${body.origin || null}, ${body.destination || null},
          ${body.pieces || null}, ${body.signature || null}, ${body.notes || null},
          ${monthYear}, ${user}
        ) RETURNING *
      `;

      return NextResponse.json({ success: true, c209, entry: result[0] });

    } else if (action === 'logistic_input') {
      const c209seq = await getNextSequence('c209', now);
      const c208seq = await getNextSequence('c208', now);
      const c209 = `${getMonthPrefix(now)}${String(c209seq).padStart(4, '0')}`;
      const c208 = `${getMonthPrefix(now)}${String(c208seq).padStart(4, '0')}`;

      const result = await sql`
        INSERT INTO entries (
          type, c209_number, c208_number, bar_number, container_code, flight_number,
          origin, destination, pieces, is_new_build, is_rw,
          signature, notes, month_year, created_by
        ) VALUES (
          'logistic_input', ${c209}, ${c208}, ${body.container_code || null}, ${body.container_code || null},
          ${body.flight_number || null}, ${body.origin || null}, ${body.destination || null},
          ${body.pieces || null}, ${body.is_new_build || false}, ${body.is_rw || false},
          ${body.signature || null}, ${body.notes || null}, ${monthYear}, ${user}
        ) RETURNING *
      `;

      return NextResponse.json({ success: true, c209, c208, entry: result[0] });

    } else {
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (err: any) {
    console.error('POST /api/entries error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
