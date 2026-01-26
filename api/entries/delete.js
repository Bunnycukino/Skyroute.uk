import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow DELETE requests
  if (req.method !== 'DELETE') {
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

    // Parse request body
    const body = req.body;
    console.log('[API] Deleting entry:', body);
    
    // Validate required fields
    if (!body.id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Entry ID is required' 
      });
    }

    // Connect to database
    const sql = neon(databaseUrl);
    
    // First, get the entry to return it in response
    const existingEntry = await sql`
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
      WHERE id = ${body.id}
    `;
    
    if (existingEntry.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Entry not found' 
      });
    }
    
    // Delete the entry
    const result = await sql`
      DELETE FROM entries
      WHERE id = ${body.id}
      RETURNING id
    `;
    
    console.log(`[API] Entry deleted: ${result[0].id}`);
    
    // Transform the deleted entry to camelCase for response
    const entry = existingEntry[0];
    const transformedEntry = {
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
    };
    
    return res.status(200).json({ 
      success: true, 
      entry: transformedEntry,
      message: 'Entry deleted successfully'
    });
    
  } catch (error) {
    console.error('[API] Error deleting entry:', error);
    console.error('[API] Error details:', error.message, error.stack);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to delete entry',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}