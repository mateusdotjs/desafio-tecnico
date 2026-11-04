import type { Config } from 'jest';

const base = {
  rootDir: '.',
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  testEnvironment: 'node',
};

const config: Config = {
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: 'coverage',
  projects: [
    {
      ...base,
      displayName: 'unit',
      testMatch: ['<rootDir>/src/**/*.spec.ts'],
      testPathIgnorePatterns: ['/node_modules/', '\\.int\\.spec\\.ts$'],
    },
    {
      ...base,
      displayName: 'int',
      testMatch: ['<rootDir>/src/**/*.int.spec.ts'],
      globalSetup: '<rootDir>/test/global-setup.ts',
      globalTeardown: '<rootDir>/test/global-teardown.ts',
      setupFiles: ['<rootDir>/test/setup-env.ts'],
      testTimeout: 30_000,
    },
  ],
};

export default config;
