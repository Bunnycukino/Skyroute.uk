import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
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
    console.log('[API] Creating entry:', body);
    
    // Validate required fields
    if (!body.c209Number && !body.c209_number) {
      return res.status(400).json({ 
        success: false, 
        error: 'c209Number is required' 
      });
    }

    // Support both camelCase and snake_case input
    const c209Number = body.c209Number || body.c209_number;
    const containerCode = body.containerCode || body.container_code || '';
    const pieces = body.pieces || 0;
    const c208Number = body.c208Number || body.c208_number || '';
    const flightNumber = body.flightNumber || body.flight_number || body.flight || '';
    const barNumber = body.barNumber || body.bar_number || '';
    const signature = body.signature || '';
    const status = body.status || 'pending';

    // Connect to database
    const sql = neon(databaseUrl);
    
    // Insert new entry
    const result = await sql`
      INSERT INTO entries (
        c209_number,
        container_code,
        pieces,
        c208_number,
        flight_number,
        bar_number,
        signature,
        status,
        created_at
      ) VALUES (
        ${c209Number},
        ${containerCode},
        ${pieces},
        ${c208Number},
        ${flightNumber},
        ${barNumber},
        ${signature},
        ${status},
        NOW()
      )
      RETURNING 
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
    `;
    
    console.log(`[API] Entry created with ID: ${result[0].id}`);
    
    // Transform to camelCase for response
    const entry = result[0];
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
    
    return res.status(201).json({ 
      success: true, 
      entry: transformedEntry,
      message: 'Entry created successfully'
    });
    
  } catch (error) {
    console.error('[API] Error creating entry:', error);
    console.error('[API] Error details:', error.message, error.stack);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to create entry',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}