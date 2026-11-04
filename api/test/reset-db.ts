import { Pool } from 'pg';

export async function resetDb(pool: Pool) {
  const { rows } = await pool.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public'`,
  );
  if (!rows.length) return;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const list = rows.map((r) => `"${r.tablename}"`).join(', ');
  await pool.query(`TRUNCATE ${list} RESTART IDENTITY CASCADE`);
}
