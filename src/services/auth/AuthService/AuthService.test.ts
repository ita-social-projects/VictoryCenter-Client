import { AuthService } from './AuthService';
import { JwtPayload } from '../../../types/Auth';

describe('AuthService', () => {
    const validPayload: JwtPayload = {
        exp: Math.floor(Date.now() / 1000) + 60,
    };
    const expiredPayload: JwtPayload = {
        exp: Math.floor(Date.now() / 1000) - 60,
    };
    function createToken(payload: object) {
        const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString(
            'base64url'
        );
        const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
        return `${header}.${body}.signature`;
    }

    it('should validate a valid access token', () => {
        const token = createToken(validPayload);
        expect(AuthService.isAccessTokenValid(token)).toBe(true);
    });

    it('should invalidate an expired token', () => {
        const token = createToken(expiredPayload);
        expect(AuthService.isAccessTokenValid(token)).toBe(false);
    });

    it('should detect token expiration', () => {
        const token = createToken(expiredPayload);
        expect(AuthService.isTokenExpired(token)).toBe(true);
    });

    it('should detect token with malformed expiration time', () => {
        const expiredPayload: JwtPayload = {};
        const token = createToken(expiredPayload);
        expect(AuthService.isTokenExpired(token)).toBe(true);
    });

    it('should detect non-expired token', () => {
        const token = createToken(validPayload);
        expect(AuthService.isTokenExpired(token)).toBe(false);
    });

    it('should detect valid structure of token', () => {
        const token = createToken(validPayload);
        expect(AuthService.hasValidStructure(token)).toBe(true);
    });

    it('should detect invalid structure (missing parts)', () => {
        expect(AuthService.hasValidStructure('invalidtoken')).toBe(false);
    });

    it('should return payload for valid token', () => {
        const token = createToken(validPayload);
        expect(AuthService.getTokenPayload(token)).toEqual(validPayload);
    });

    it('should return null for invalid token in getTokenPayload', () => {
        expect(AuthService.getTokenPayload('invalidtoken')).toBeNull();
    });

    it('should decode valid token', () => {
        const token = createToken(validPayload);
        expect(AuthService.decodeToken(token)).toEqual(validPayload);
    });

    it('should return null for invalid token in decodeToken', () => {
        expect(AuthService.decodeToken('invalidtoken')).toBeNull();
    });

    it('should handle malformed base64 in decodeToken', () => {
        const token = 'very.bad.signature';
        expect(AuthService.decodeToken(token)).toBeNull();
    });
});
