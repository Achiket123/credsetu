module.exports = {
    testEnvironment: 'node',
    transform: {
        '^.+\\.ts$': ['ts-jest', {
            tsconfig: { module: 'commonjs', moduleResolution: 'node', esModuleInterop: true },
        }],
    },
    testMatch: ['**/__tests__/**/*.test.ts'],
};
