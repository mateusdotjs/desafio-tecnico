import { Pool } from 'pg';
import { resetDb } from '../../test/reset-db';

describe('test database', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  });

  afterAll(() => pool.end());

  beforeEach(() => resetDb(pool));

  it('connects to the worker database', async () => {
    const { rows } = await pool.query<{ db: string }>(
      'SELECT current_database() AS db',
    );
    expect(rows[0].db).toMatch(/^app_test_\d+$/);
  });

  it('applies migrations', async () => {
    const { rows } = await pool.query<{ appointments: string | null }>(
      `SELECT to_regclass('public.appointments') AS appointments`,
    );
    expect(rows[0].appointments).not.toBeNull();
  });

  it('enables the unaccent extension', async () => {
    const { rows } = await pool.query<{ count: number }>(
      `SELECT count(*)::int AS count FROM pg_extension WHERE extname = 'unaccent'`,
    );
    expect(rows[0].count).toBe(1);
  });
});
