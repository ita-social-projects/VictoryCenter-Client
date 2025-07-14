export type Credentials = {
    email: string;
    password: string;
};

export type AuthResponse = {
    accessToken: string;
};

export interface JwtPayload {
    iss?: string;
    sub?: string;
    aud?: string | string[];
    exp?: number;
    nbf?: number;
    iat?: number;
    jti?: string;
    [key: string]: any;
}
