import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    // Use POSTGRES_URL exclusively
    const databaseUrl = process.env.POSTGRES_URL;
    
    if (!databaseUrl) {
      console.error('[API] POSTGRES_URL not configured');
      return res.status(500).json({ 
        success: false, 
        error: 'Database not configured - POSTGRES_URL missing' 
      });
    }

    console.log('[API] Fetching entries using POSTGRES_URL...');
    
    // Connect to database
    const sql = neon(databaseUrl);
    
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
    
    return res.status(200).json({ 
      success: true, 
      entries: transformedEntries,
      count: transformedEntries.length
    });
    
  } catch (error) {
    console.error('[API] Error fetching entries:', error);
    console.error('[API] Error details:', error.message, error.stack);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch entries',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}