import { isAccessTokenValid, isTokenExpired, hasValidStructure, getTokenPayload, decodeToken } from './AuthService';
import { JwtPayload } from '../../../types/Auth';

describe('AuthService functions', () => {
    const nowSec = Math.floor(Date.now() / 1000);
    const validPayload: JwtPayload = { exp: nowSec + 60 };
    const expiredPayload: JwtPayload = { exp: nowSec - 60 };
    const malformedExpPayload: JwtPayload = {};

    function createToken(payload: object): string {
        const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
        const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
        return `${header}.${body}.signature`;
    }

    describe('isAccessTokenValid', () => {
        it('returns true when structure is valid and not expired', () => {
            const token = createToken(validPayload);
            expect(isAccessTokenValid(token)).toBe(true);
        });

        it('returns false when token is expired or malformed', () => {
            const expired = createToken(expiredPayload);
            expect(isAccessTokenValid(expired)).toBe(false);

            const malformed = createToken(malformedExpPayload);
            expect(isAccessTokenValid(malformed)).toBe(false);
        });
    });

    describe('isTokenExpired', () => {
        it('returns false for non-expired token', () => {
            const token = createToken(validPayload);
            expect(isTokenExpired(token)).toBe(false);
        });

        it('returns true for expired token', () => {
            const token = createToken(expiredPayload);
            expect(isTokenExpired(token)).toBe(true);
        });

        it('returns true if payload.exp is missing or not a number', () => {
            const token = createToken(malformedExpPayload);
            expect(isTokenExpired(token)).toBe(true);
        });
    });

    describe('hasValidStructure', () => {
        it('returns true for a valid JWT format', () => {
            const token = createToken(validPayload);
            expect(hasValidStructure(token)).toBe(true);
        });

        it('returns false if token is empty or malformed', () => {
            expect(hasValidStructure('')).toBe(false);
            expect(hasValidStructure('invalid')).toBe(false);
            expect(hasValidStructure('invalid.token')).toBe(false);
        });
    });

    describe('getTokenPayload', () => {
        it('returns the payload for valid token', () => {
            const token = createToken(validPayload);
            expect(getTokenPayload(token)).toEqual(validPayload);
        });

        it('returns null for invalid token', () => {
            expect(getTokenPayload('very.bad.token')).toBeNull();
        });
    });

    describe('decodeToken', () => {
        it('decodes a correct token', () => {
            const token = createToken(validPayload);
            expect(decodeToken(token)).toEqual(validPayload);
        });

        it('returns null for invalid token', () => {
            expect(decodeToken('bad.token')).toBeNull();
        });
    });
});
