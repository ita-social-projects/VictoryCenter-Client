import { describe, it, expect } from '@jest/globals';

jest.mock('i18next', () => ({
    use: jest.fn().mockReturnThis(),
    init: jest.fn(),
}));

jest.mock('i18next-browser-languagedetector', () => ({}));

describe('i18n setup', () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...OLD_ENV };
    });

    afterEach(() => {
        process.env = OLD_ENV;
    });

    function setNodeEnv(env: string) {
        Object.defineProperty(process.env, 'NODE_ENV', {
            value: env,
            configurable: true,
        });
    }

    it('should not use LanguageDetector when NODE_ENV is test', () => {
        setNodeEnv('test');

        const i18next = require('i18next');
        jest.mock('i18next', () => ({
            use: jest.fn().mockReturnThis(),
            init: jest.fn(),
        }));
        jest.mock('i18next-browser-languagedetector', () => ({}));

        jest.resetModules();
        require('./i18n');

        expect(i18next.use).not.toHaveBeenCalledWith(expect.any(require('i18next-browser-languagedetector')));
    });

    it('should use LanguageDetector when NODE_ENV is not test', () => {
        setNodeEnv('development');

        jest.resetModules();
        const i18next = require('i18next');
        jest.mock('i18next', () => ({
            use: jest.fn().mockReturnThis(),
            init: jest.fn(),
        }));
        jest.mock('i18next-browser-languagedetector', () => ({}));

        require('./i18n');

        const LanguageDetector = require('i18next-browser-languagedetector');
        expect(i18next.use).toHaveBeenCalledWith(LanguageDetector);
    });
});
