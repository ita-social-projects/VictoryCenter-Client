import axios from 'axios';
import { API_ROUTES } from '../../const/common/api-routes/main-api';

export const AuthClient = axios.create({
    baseURL: API_ROUTES.BASE,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});
