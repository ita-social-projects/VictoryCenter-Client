import { AxiosError } from 'axios';
import { getLoginErrorType } from './get-login-error-type';

const createAxiosError = (status: number) =>
    new AxiosError('Request failed', 'ERR_BAD_RESPONSE', undefined, undefined, {
        status,
        statusText: '',
        headers: {},
        config: {} as never,
        data: null,
    });

describe('getLoginErrorType', () => {
    it.each([400, 401])('returns invalid-credentials for status %i', (status) => {
        expect(getLoginErrorType(createAxiosError(status))).toBe('invalid-credentials');
    });

    it.each([403, 429, 500, 503])('returns service-error for status %i', (status) => {
        expect(getLoginErrorType(createAxiosError(status))).toBe('service-error');
    });

    it('returns service-error for a network error without response', () => {
        expect(getLoginErrorType(new AxiosError('Network Error', 'ERR_NETWORK'))).toBe('service-error');
    });

    it('returns service-error for a non-axios error', () => {
        expect(getLoginErrorType(new Error('boom'))).toBe('service-error');
        expect(getLoginErrorType({ response: { status: 401 } })).toBe('service-error');
        expect(getLoginErrorType(undefined)).toBe('service-error');
    });
});
