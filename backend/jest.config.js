module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/src/tests/jest.setup.js'],
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/tests/**',
    '!src/scripts/**',
    '!src/server.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
  testTimeout: 30000,
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  transformIgnorePatterns: [
    'node_modules/(?!(@concordium)/)'
  ],
  moduleNameMapper: {
    '^@concordium/web-sdk$': '<rootDir>/src/tests/__mocks__/concordium-web-sdk.js'
  }
};
