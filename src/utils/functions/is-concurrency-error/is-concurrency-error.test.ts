import { AxiosError } from 'axios';
import { isConcurrencyError } from './is-concurrency-error';

describe('isConcurrencyError', () => {
    it('returns true for an AxiosError with status 409', () => {
        const error = new AxiosError('Conflict', 'ERR_BAD_REQUEST', undefined, undefined, {
            status: 409,
            statusText: 'Conflict',
            headers: {},
            config: {} as never,
            data: {
                type: 'https://tools.ietf.org/html/rfc9110#section-15.5.10',
                title: 'Conflict',
                status: 409,
                detail: 'Metric was modified by another user. Please refresh and try again.',
            },
        });

        expect(isConcurrencyError(error)).toBe(true);
    });

    it('returns false for an AxiosError with status 400', () => {
        const error = new AxiosError('Bad Request', 'ERR_BAD_REQUEST', undefined, undefined, {
            status: 400,
            statusText: 'Bad Request',
            headers: {},
            config: {} as never,
            data: {
                type: 'https://tools.ietf.org/html/rfc9110#section-15.5.1',
                title: 'Bad Request',
                status: 400,
                detail: "'Value' must be greater than or equal to '0'.",
            },
        });

        expect(isConcurrencyError(error)).toBe(false);
    });

    it('returns false for an AxiosError with status 404', () => {
        const error = new AxiosError('Not Found', 'ERR_BAD_REQUEST', undefined, undefined, {
            status: 404,
            statusText: 'Not Found',
            headers: {},
            config: {} as never,
            data: null,
        });

        expect(isConcurrencyError(error)).toBe(false);
    });

    it('returns false for an AxiosError with no response (network error)', () => {
        const error = new AxiosError('Network Error', 'ERR_NETWORK');

        expect(isConcurrencyError(error)).toBe(false);
    });

    it('returns false for a plain Error', () => {
        expect(isConcurrencyError(new Error('Something went wrong'))).toBe(false);
    });

    it('returns false for a non-axios error-like object', () => {
        expect(isConcurrencyError({ isAxiosError: false, response: { status: 409 } })).toBe(false);
    });

    it('returns false for null', () => {
        expect(isConcurrencyError(null)).toBe(false);
    });

    it('returns false for undefined', () => {
        expect(isConcurrencyError(undefined)).toBe(false);
    });

    it('returns false for a string', () => {
        expect(isConcurrencyError('some error')).toBe(false);
    });
});
