import axios from 'axios';

export type LoginErrorType = 'invalid-credentials' | 'service-error';

const INVALID_CREDENTIALS_STATUSES = new Set([400, 401]);

export const getLoginErrorType = (error: unknown): LoginErrorType => {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    return status !== undefined && INVALID_CREDENTIALS_STATUSES.has(status) ? 'invalid-credentials' : 'service-error';
};
