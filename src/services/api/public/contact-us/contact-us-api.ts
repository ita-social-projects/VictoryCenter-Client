import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { axiosInstance } from '@/services/api/axios';
import { SubmitContactUsFormDto } from '@/types/public/contact-us';

export const submitContactUsForm = async (data: SubmitContactUsFormDto): Promise<void> => {
    await axiosInstance.post(API_ROUTES.CONTACT_US, data);
};
