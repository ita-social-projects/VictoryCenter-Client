import { AxiosInstance } from 'axios';
import { PdfReportDto } from '@/types/admin/pdf-section';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { PaginationResult } from '@/types/admin/common';
import { axiosInstance } from '@/services/api/axios';

export const PdfReportsApi = {
    create: async (client: AxiosInstance, file: File, languageId: number): Promise<PdfReportDto> => {
        const formData = new FormData();
        formData.append('File', file);
        formData.append('LanguageId', String(languageId));

        const response = await client.post<PdfReportDto>(API_ROUTES.PDF_REPORTS.BASE, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    delete: async (client: AxiosInstance, id: number): Promise<void> => {
        await client.delete(`${API_ROUTES.PDF_REPORTS.BASE}/${id}`);
    },

    rename: async (client: AxiosInstance, id: number, newName: string): Promise<PdfReportDto> => {
        const response = await client.put<PdfReportDto>(`${API_ROUTES.PDF_REPORTS.BASE}/${id}`, {
            name: newName,
        });
        return response.data;
    },

    reorder: async (client: AxiosInstance, languageId: number, orderedIds: number[]): Promise<void> => {
        await client.put(`${API_ROUTES.PDF_REPORTS.BASE}/reorder`, {
            languageId,
            orderedIds,
        });
    },

    getAll: async (
        client: AxiosInstance,
        filter: { offset: number; limit: number; languageId?: number },
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

    getAllByLanguageId: async (
        languageId: number,
        filter: { offset: number; limit: number },
    ): Promise<PaginationResult<PdfReportDto>> => {
        const response = await axiosInstance.get<PaginationResult<PdfReportDto>>(
            `${API_ROUTES.PDF_REPORTS.BY_LANGUAGE_ID}/${languageId}`,
            { params: filter },
        );
        return response.data;
    },

    getPublicFileUrl: (id: number): string => {
        return `${API_ROUTES.BASE}/${API_ROUTES.PDF_REPORTS.BASE}/${id}/file`;
    },
};
