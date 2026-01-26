import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow PUT requests
  if (req.method !== 'PUT') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    // Get database connection string
    const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      console.error('[API] No database URL found in env');
      return res.status(500).json({ 
        success: false, 
        error: 'Database not configured' 
      });
    }

    // Parse request body
    const body = req.body;
    console.log('[API] Updating entry:', body);
    
    // Validate required fields
    if (!body.id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Entry ID is required' 
      });
    }

    // Connect to database
    const sql = neon(databaseUrl);
    
    // Build update query dynamically based on provided fields
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;
    
    // Map of camelCase to snake_case
    const fieldMapping = {
      c209Number: 'c209_number',
      c209_number: 'c209_number',
      containerCode: 'container_code',
      container_code: 'container_code',
      pieces: 'pieces',
      c208Number: 'c208_number',
      c208_number: 'c208_number',
      flightNumber: 'flight_number',
      flight_number: 'flight_number',
      flight: 'flight_number',
      barNumber: 'bar_number',
      bar_number: 'bar_number',
      signature: 'signature',
      status: 'status'
    };
    
    // Build SET clause
    Object.keys(body).forEach(key => {
      if (key !== 'id' && fieldMapping[key]) {
        const dbField = fieldMapping[key];
        updateFields.push(`${dbField} = $${paramIndex}`);
        updateValues.push(body[key]);
        paramIndex++;
      }
    });
    
    if (updateFields.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No fields to update' 
      });
    }
    
    // Add ID as last parameter
    updateValues.push(body.id);
    
    // Execute update
    const query = `
      UPDATE entries 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
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
    
    console.log('[API] Update query:', query);
    console.log('[API] Update values:', updateValues);
    
    const result = await sql(query, updateValues);
    
    if (result.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Entry not found' 
      });
    }
    
    console.log(`[API] Entry updated: ${result[0].id}`);
    
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
    
    return res.status(200).json({ 
      success: true, 
      entry: transformedEntry,
      message: 'Entry updated successfully'
    });
    
  } catch (error) {
    console.error('[API] Error updating entry:', error);
    console.error('[API] Error details:', error.message, error.stack);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to update entry',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}