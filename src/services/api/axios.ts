import axios from 'axios';
import { API_ROUTES } from '../../const/urls/main-api';

export const axiosInstance = axios.create({
    baseURL: API_ROUTES.BASE,
    headers: {
        'Content-Type': 'application/json',
    },
});
