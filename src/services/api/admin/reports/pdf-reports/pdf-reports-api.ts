import { AxiosInstance } from 'axios';
import { PdfReportDto } from '@/types/admin/pdf-section';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { PaginationResult } from '@/types/admin/common';

export const PdfReportsApi = {
    create: async (client: AxiosInstance, file: File): Promise<PdfReportDto> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await client.post<PdfReportDto>(API_ROUTES.PDF_REPORTS.BASE, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    delete: async (client: AxiosInstance, id: number): Promise<void> => {
        await client.delete(`${API_ROUTES.PDF_REPORTS.BASE}/${id}`);
    },

    getAll: async (
        client: AxiosInstance,
        filter: { offset: number; limit: number },
    ): Promise<PaginationResult<PdfReportDto>> => {
        const response = await client.get<PaginationResult<PdfReportDto>>(API_ROUTES.PDF_REPORTS.BASE, {
            params: filter,
        });
        return response.data;
    },

    fetchById: async (client: AxiosInstance, id: number): Promise<Blob> => {
        const response = await client.get<Blob>(`${API_ROUTES.PDF_REPORTS.BASE}/${id}`, {
            responseType: 'blob',
        });
        return response.data;
    },
};
