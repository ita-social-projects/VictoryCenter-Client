import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { axiosInstance } from '@/services/api/axios';

export interface ContactInquiryDto {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export const submitContactInquiry = async (data: ContactInquiryDto): Promise<void> => {
    await axiosInstance.post(API_ROUTES.CONTACT_INQUIRY.SUBMIT, data);
};
