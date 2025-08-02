import axios from 'axios';
import { API_ROUTES } from '../../const/common/api-routes/main-api';

export const axiosInstance = axios.create({
    baseURL: API_ROUTES.BASE,
    headers: {
        'Content-Type': 'application/json',
    },
});
