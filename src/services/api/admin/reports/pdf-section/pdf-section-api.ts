import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { PdfSection } from '@/types/admin/pdf-section';
import { AxiosInstance } from 'axios';

export const PdfSectionApi = {
    getPdfSection: async (client: AxiosInstance): Promise<PdfSection> => {
        const response = await client.get(API_ROUTES.PDF_SECTION.CONTENT);
        return response.data;
    },

    updatePdfSection: async (client: AxiosInstance, data: PdfSection): Promise<PdfSection> => {
        const response = await client.patch(API_ROUTES.PDF_SECTION.BASE, data);
        return response.data;
    },
};
