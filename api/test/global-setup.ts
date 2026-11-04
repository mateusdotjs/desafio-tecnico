import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { dbUrl } from './db-url';

export default async function (globalConfig: { maxWorkers: number }) {
  const container = await new PostgreSqlContainer('postgres:18')
    .withDatabase('app_template')
    .withTmpFs({ '/var/lib/postgresql': 'rw' })
    .withCommand(['postgres', '-c', 'fsync=off', '-c', 'max_connections=300'])
    .start();

  const baseUrl = container.getConnectionUri();
  process.env.TEST_PG_BASE_URL = baseUrl;

  // Migrate once into the template database.
  const template = new Pool({ connectionString: baseUrl });
  await migrate(drizzle({ client: template }), {
    migrationsFolder: './drizzle',
  });
  await template.end();

  // Clone one database per Jest worker from that template.
  const admin = new Pool({ connectionString: dbUrl(baseUrl, 'postgres') });
  for (let i = 1; i <= globalConfig.maxWorkers; i++) {
    await admin.query(`CREATE DATABASE app_test_${i} TEMPLATE app_template`);
  }
  await admin.end();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  (globalThis as any).__PG__ = container;
}
