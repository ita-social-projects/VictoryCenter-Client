import { submitContactUsForm } from './contact-us-api';
import { axiosInstance } from '@/services/api/axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';

jest.mock('@/services/api/axios', () => ({
    axiosInstance: {
        post: jest.fn(),
    },
}));

describe('ContactUs API', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('submits contact us form successfully', async () => {
        const mockData = {
            captchaResponseToken: 'token123',
            fromName: 'Test Name',
            fromEmail: 'test@example.com',
            subject: 'Test Subject',
            message: 'Test Message',
        };

        (axiosInstance.post as jest.Mock).mockResolvedValueOnce({});

        await submitContactUsForm(mockData);

        expect(axiosInstance.post).toHaveBeenCalledWith(API_ROUTES.CONTACT_US, mockData);
        expect(axiosInstance.post).toHaveBeenCalledTimes(1);
    });

    it('propagates errors from axios', async () => {
        const mockData = {
            captchaResponseToken: 'token123',
            fromName: 'Test Name',
            fromEmail: 'test@example.com',
            subject: 'Test Subject',
            message: 'Test Message',
        };

        const error = new Error('Network Error');
        (axiosInstance.post as jest.Mock).mockRejectedValueOnce(error);

        await expect(submitContactUsForm(mockData)).rejects.toThrow('Network Error');
    });
});
