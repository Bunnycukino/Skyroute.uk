export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

function getUser(req: NextRequest): string | null {
  const cookie = req.cookies.get('skyroute_user');
  return cookie ? cookie.value : null;
}

function getMonthPrefix(date: Date) {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return months[date.getMonth()];
}

async function getNextSequence(type: 'c209' | 'c208', date: Date) {
  const prefix = getMonthPrefix(date);
  const pattern = prefix + '%';
  const col = type === 'c209' ? 'c209_number' : 'c208_number';
  
  const result = await sql`
    SELECT ${sql(col)} as val FROM entries 
    WHERE ${sql(col)} LIKE ${pattern}
    ORDER BY ${sql(col)} DESC LIMIT 1
  `;
  
  if (result.length === 0) return 1;
  const lastVal = result[0].val;
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
    const query = sql`SELECT * FROM entries WHERE 1=1`;
    if (type) query.append(sql` AND type = ${type}`);
    if (search) query.append(sql` AND (c209_number ILIKE ${'%' + search + '%'} OR c208_number ILIKE ${'%' + search + '%'} OR flight_number ILIKE ${'%' + search + '%'} OR container_code ILIKE ${'%' + search + '%'})`);
    
    entries = await query.append(sql` ORDER BY created_at DESC LIMIT ${limit}`);

    const statsResult = await sql`
      SELECT 
        COUNT(*) AS total_entries,
        COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) AS today_entries,
        COUNT(*) FILTER (WHERE expires_at IS NOT NULL AND expires_at < NOW() + INTERVAL '24 hours' AND expires_at > NOW()) AS expiring_soon,
        COUNT(DISTINCT flight_number) AS total_flights
      FROM entries
    `;

    return NextResponse.json({ entries, stats: statsResult[0] });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];
    const monthYear = now.toLocaleString('en-GB', { month: 'short', year: '2y' }).toUpperCase().replace(' ', '-');

    if (body.action === 'ramp_input') {
      const seq = await getNextSequence('c209', now);
      const c209 = getMonthPrefix(now) + String(seq).padStart(4, '0');
      
      const result = await sql`
        INSERT INTO entries (
          type, c209_number, ramp_date, ramp_time, month_year,
          container_code, pieces, flight_number, signature, ramp_comment,
          created_by, expires_at
        ) VALUES (
          'c209', ${c209}, ${dateStr}, ${timeStr}, ${monthYear},
          ${body.container_code}, ${body.pieces}, ${body.flight_number}, ${body.signature}, ${body.notes},
          ${user}, ${new Date(now.getTime() + 48 * 60 * 60 * 1000)}
        ) RETURNING *
      `;
      return NextResponse.json({ entry: result[0] });
    }

    if (body.action === 'logistic_input') {
      const isRW = body.flight_number?.toUpperCase().startsWith('RW');
      const isNewBuild = body.c209_number?.toUpperCase() === 'NEW BUILD';
      
      let c208 = isRW ? 'RW' : '';
      if (!isRW) {
        const seq = await getNextSequence('c208', now);
        c208 = getMonthPrefix(now) + String(seq).padStart(4, '0');
      }

      if (isNewBuild) {
        const result = await sql`
          INSERT INTO entries (
            type, c209_number, c208_number, flight_date, flight_time, flight_month_year,
            flight_number, signature, bar_number, pieces, is_new_build, is_rw_flight, created_by
          ) VALUES (
            'c208', 'NEW BUILD', ${c208}, ${dateStr}, ${timeStr}, ${monthYear},
            ${body.flight_number}, ${body.signature}, ${body.bar_number}, ${body.pieces}, true, ${isRW}, ${user}
          ) RETURNING *
        `;
        return NextResponse.json({ entry: result[0] });
      } else {
        // Match existing C209
        const existing = await sql`SELECT * FROM entries WHERE c209_number = ${body.c209_number} AND type = 'c209' LIMIT 1`;
        if (existing.length === 0) return NextResponse.json({ error: 'C209 not found' }, { status: 404 });
        
        const result = await sql`
          UPDATE entries SET
            c208_number = ${c208},
            new_flight_number = ${body.flight_number},
            new_signature = ${body.signature},
            flight_date = ${dateStr},
            flight_time = ${timeStr},
            flight_month_year = ${monthYear},
            new_bar_number = ${body.bar_number || existing[0].container_code},
            new_pieces = ${body.pieces || existing[0].pieces},
            is_rw_flight = ${isRW},
            status = 'completed',
            updated_at = NOW()
          WHERE id = ${existing[0].id}
          RETURNING *
        `;
        return NextResponse.json({ entry: result[0] });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
