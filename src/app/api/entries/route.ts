export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

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
  const col = type === 'c209' ? 'c209_number' : 'c208_number';
  const { data, error } = await supabase
    .from('entries')
    .select(col)
    .like(col, prefix + '%')
    .order(col, { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) return 1;
  const lastVal = (data[0] as any)[col] as string;
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

    let query = supabase.from('entries').select('*').order('created_at', { ascending: false }).limit(limit);

    if (type) query = query.eq('type', type);
    if (search) {
      query = query.or(
        `c209_number.ilike.%${search}%,c208_number.ilike.%${search}%,flight_number.ilike.%${search}%,container_code.ilike.%${search}%,bar_number.ilike.%${search}%`
      );
    }

    const { data: entries, error: entriesError } = await query;
    if (entriesError) throw entriesError;

    const { count: totalCount } = await supabase.from('entries').select('*', { count: 'exact', head: true });
    
    const today = new Date().toISOString().split('T')[0];
    const { count: todayCount } = await supabase.from('entries').select('*', { count: 'exact', head: true })
      .gte('created_at', today + 'T00:00:00')
      .lte('created_at', today + 'T23:59:59');

    const stats = {
      totalEntries: totalCount || 0,
      todayEntries: todayCount || 0,
      totalFlights: 0,
    };

    return NextResponse.json({ entries, stats });
  } catch (err: any) {
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
    const monthYear = getMonthPrefix(now) + '-' + now.getFullYear().toString().slice(2);

    if (action === 'ramp_input') {
      const seq = await getNextSequence('c209', now);
      const c209 = `${getMonthPrefix(now)}${String(seq).padStart(4, '0')}`;

      const { data: result, error } = await supabase.from('entries').insert({
        type: 'ramp_input',
        c209_number: c209,
        bar_number: body.container_code || null,
        container_code: body.container_code || null,
        flight_number: body.flight_number || null,
        origin: body.origin || null,
        destination: body.destination || null,
        pieces: body.pieces || 0,
        signature: body.signature || null,
        notes: body.notes || null,
        month_year: monthYear,
        created_by: user,
      }).select().single();

      if (error) throw error;
      return NextResponse.json({ success: true, c209, entry: result });

    } else if (action === 'logistic_input') {
      const c208seq = await getNextSequence('c208', now);
      const c208 = `${getMonthPrefix(now)}${String(c208seq).padStart(4, '0')}`;
      
      let c209 = null;
      if (body.is_new_build) {
        c209 = 'NEW BUILD';
      } else {
        const c209seq = await getNextSequence('c209', now);
        c209 = `${getMonthPrefix(now)}${String(c209seq).padStart(4, '0')}`;
      }

      const { data: result, error } = await supabase.from('entries').insert({
        type: 'logistic_input',
        c209_number: c209,
        c208_number: c208,
        bar_number: body.container_code || null,
        container_code: body.container_code || null,
        flight_number: body.flight_number || null,
        origin: body.origin || null,
        destination: body.destination || null,
        pieces: body.pieces || 0,
        is_new_build: body.is_new_build || false,
        is_rw_flight: body.is_rw || false,
        signature: body.signature || null,
        notes: body.notes || null,
        month_year: monthYear,
        created_by: user,
      }).select().single();

      if (error) throw error;
      return NextResponse.json({ success: true, c209, c208, entry: result });

    } else {
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const { error } = await supabase.from('entries').delete().eq('id', parseInt(id));
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
