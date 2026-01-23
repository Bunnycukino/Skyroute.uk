import { neon } from '@neondatabase/serverless';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // Only allow POST requests
  if (req.method !== 'POST') {
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

    // Parse request body
    const body = await req.json();
    console.log('[API] Creating entry:', body);
    
    // Validate required fields
    if (!body.c209Number && !body.c209_number) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'c209Number is required' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
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

    // Connect to Neon
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
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        entry: transformedEntry,
        message: 'Entry created successfully'
      }),
      { 
        status: 201, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0'
        } 
      }
    );
    
  } catch (error) {
    console.error('[API] Error creating entry:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to create entry' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}