import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  try {
    const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      return res.status(500).json({ 
        success: false,
        error: 'No database URL found',
        envVars: Object.keys(process.env).filter(k => k.includes('POSTGRES') || k.includes('DATABASE'))
      });
    }

    const sql = neon(databaseUrl);
    
    // Get list of all tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    // Try to count entries in 'entries' table if it exists
    let entriesCount = null;
    let entriesError = null;
    
    try {
      const count = await sql`SELECT COUNT(*) as count FROM entries`;
      entriesCount = count[0].count;
    } catch (err) {
      entriesError = err.message;
    }
    
    return res.status(200).json({
      success: true,
      database: {
        connected: true,
        urlSource: process.env.POSTGRES_URL ? 'POSTGRES_URL' : 'DATABASE_URL',
        urlPreview: databaseUrl.substring(0, 30) + '...' + databaseUrl.substring(databaseUrl.length - 20)
      },
      tables: tables.map(t => t.table_name),
      entriesTable: {
        exists: entriesError === null,
        count: entriesCount,
        error: entriesError
      }
    });
    
  } catch (error) {
    return res.status(500).json({ 
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}