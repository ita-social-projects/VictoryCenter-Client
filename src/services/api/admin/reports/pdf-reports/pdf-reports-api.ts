import { AxiosInstance } from 'axios';
import { PdfReportDto } from '@/types/admin/pdf-section';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { PaginationResult } from '@/types/admin/common';

export const PdfReportsApi = {
    getAll: async (
        client: AxiosInstance,
        filter: { offset: number; limit: number },
    ): Promise<PaginationResult<PdfReportDto>> => {
        const response = await client.get<PaginationResult<PdfReportDto>>(API_ROUTES.PDF_REPORTS.BASE, {
            params: filter,
        });
        return response.data;
    },
};
