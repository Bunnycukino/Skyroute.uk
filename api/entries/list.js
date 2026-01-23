import { neon } from '@neondatabase/serverless';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Get database connection string from environment variable
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      console.error('[API] DATABASE_URL not configured');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Database not configured' 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Connect to Neon
    const sql = neon(databaseUrl);
    
    console.log('[API] Fetching entries from Neon database...');
    
    // Query all entries, ordered by creation date (newest first)
    const entries = await sql`
      SELECT 
        id,
        c209_number,
        container_code,
        pieces,
        c208_number,
        flight_number,
        bar_number,
        signature,
        status,
        created_at
      FROM entries
      ORDER BY created_at DESC
    `;
    
    console.log(`[API] Found ${entries.length} entries`);
    
    // Transform snake_case to camelCase for frontend
    const transformedEntries = entries.map(entry => ({
      id: entry.id,
      c209Number: entry.c209_number,
      containerCode: entry.container_code,
      pieces: entry.pieces,
      c208Number: entry.c208_number,
      flightNumber: entry.flight_number,
      barNumber: entry.bar_number,
      signature: entry.signature,
      status: entry.status,
      createdAt: entry.created_at
    }));
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        entries: transformedEntries,
        count: transformedEntries.length
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0'
        } 
      }
    );
    
  } catch (error) {
    console.error('[API] Error fetching entries:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to fetch entries' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}