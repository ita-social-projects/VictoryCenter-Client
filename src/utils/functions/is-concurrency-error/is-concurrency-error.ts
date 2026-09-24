import axios from 'axios';

export const isConcurrencyError = (error: unknown): boolean =>
    axios.isAxiosError(error) && error.response?.status === 409;
