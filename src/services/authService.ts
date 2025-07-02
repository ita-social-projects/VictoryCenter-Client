import { JwtPayload } from "../types/Auth";

export class AuthService {
    public static isAccessTokenValid(token: string): boolean {
        return this.hasValidStructure(token) && !this.isTokenExpired(token);
    }

    public static isTokenExpired(token: string): boolean {
        const payload = this.decodeToken(token);
        if (!payload || typeof payload.exp !== "number") {
            return true;
        }
        const nowSec = Date.now() / 1000;
        return payload.exp <= nowSec;
    }

    public static hasValidStructure(token: string): boolean {
        return !!token && this.decodeToken(token) !== null;
    }

    public static getTokenPayload(token: string): JwtPayload | null {
        return this.decodeToken(token);
    }

    public static decodeToken(token: string): JwtPayload | null {
        try {
            const parts = token.split(".");
            if (parts.length !== 3) return null;
            const payloadJson = this.base64UrlDecode(parts[1]);
            return JSON.parse(payloadJson) as JwtPayload;
        } catch {
            return null;
        }
    }

    private static base64UrlDecode(str: string): string {
        const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
        const pad = "=".repeat((4 - (base64.length % 4)) % 4);
        return decodeURIComponent(
            atob(base64 + pad)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
    }
}
