import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;

const sql = connectionString
  ? postgres(connectionString, {
      ssl: { rejectUnauthorized: false },
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
    })
  : postgres('postgres://placeholder', {
      ssl: false,
      prepare: false,
    });

export default sql;
