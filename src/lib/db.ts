import postgres from 'postgres';

function createSql() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return postgres('postgres://localhost/placeholder', { prepare: false });
  }

  // Use regex to parse connection string
  // Handles Supabase format: postgresql://user.projectref:password@host:port/db
  const match = dbUrl.match(
    /^(?:postgres(?:ql)?:\/\/)([^:]+):([^@]+)@([^:/]+)(?::(\d+))?(?:\/(.*))?$/
  );

  if (!match) {
    // Fallback: pass URL directly
    return postgres(dbUrl, { prepare: false, ssl: { rejectUnauthorized: false } });
  }

  const username = decodeURIComponent(match[1]);
  const password = decodeURIComponent(match[2]);
  const host = match[3];
  const port = parseInt(match[4] || '5432');
  const database = match[5] || 'postgres';

  return postgres({
    host,
    port,
    database,
    username,
    password,
    ssl: { rejectUnauthorized: false },
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
  });
}

const sql = createSql();
export default sql;
