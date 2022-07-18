module.exports = {
    preset: 'ts-jest',
    testMatch: ['<rootDir>/tests/*spec.[jt]s'],
    rootDir: __dirname,
    testEnvironment: 'jsdom'
}