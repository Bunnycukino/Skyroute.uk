import postgres from 'postgres';

function createSql() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return postgres('postgres://localhost/placeholder', { prepare: false });
  }
  // Parse connection string manually to handle Supabase's user.projectref format
  const url = new URL(dbUrl);
  const username = decodeURIComponent(url.username);
  const password = decodeURIComponent(url.password);
  const host = url.hostname;
  const port = parseInt(url.port) || 5432;
  const database = url.pathname.slice(1);

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
