import axios from 'axios';
import { API_ROUTES } from '../../const/urls/main-api';

export const AuthClient = axios.create({
    baseURL: API_ROUTES.BASE,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});
