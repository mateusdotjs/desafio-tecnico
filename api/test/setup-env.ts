import { dbUrl } from './db-url';

process.env.DATABASE_URL = dbUrl(
  process.env.TEST_PG_BASE_URL!,
  `app_test_${process.env.JEST_WORKER_ID}`,
);

// Refuse to run tests against any database other than a worker database.
if (!process.env.DATABASE_URL.includes('app_test_')) {
  throw new Error('DATABASE_URL de teste inválida');
}
