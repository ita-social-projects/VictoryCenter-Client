import { getEnvVariable } from './getEnvVariable';

describe('getEnvVariable', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('returns existing environment variable', () => {
        process.env.TEST_VAR = 'test_value';
        const result = getEnvVariable('TEST_VAR');
        expect(result).toBe('test_value');
    });

    it('returns fallback value if environment variable is not set', () => {
        const result = getEnvVariable('TEST_VAR', 'fallback_value');
        expect(result).toBe('fallback_value');
    });

    it('throws if neither env var nor fallback is provided', () => {
        process.env.TEST_VAR = undefined;
        expect(() => getEnvVariable('TEST_VAR')).toThrowError(
            'Missing environment variable: TEST_VAR'
        );
    });
    
    it('throws if fallback is empty string', () => {
        process.env.TEST_VAR = undefined;
        expect(() => getEnvVariable('TEST_VAR', '')).toThrowError(
            'Missing environment variable: TEST_VAR'
        );
    });
});
