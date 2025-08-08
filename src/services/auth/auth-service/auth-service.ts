import { JwtPayload } from '../../../types/admin/Auth';

export function isAccessTokenValid(token: string): boolean {
    return hasValidStructure(token) && !isTokenExpired(token);
}

export function isTokenExpired(token: string): boolean {
    const payload = decodeToken(token);
    if (!payload || typeof payload.exp !== 'number') {
        return true;
    }
    const nowSec = Date.now() / 1000;
    return payload.exp <= nowSec;
}

export function hasValidStructure(token: string): boolean {
    return !!token && decodeToken(token) !== null;
}

export function getTokenPayload(token: string): JwtPayload | null {
    return decodeToken(token);
}

export function decodeToken(token: string): JwtPayload | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payloadJson = base64UrlDecode(parts[1]);
        return JSON.parse(payloadJson) as JwtPayload;
    } catch {
        return null;
    }
}

function base64UrlDecode(str: string): string {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const pad = '='.repeat((4 - (base64.length % 4)) % 4);
    return decodeURIComponent(
        atob(base64 + pad)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join(''),
    );
}
