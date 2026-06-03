import { AxiosInstance } from 'axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import {
    CreatePdfSectionLocalizationDto,
    PdfSectionLocalizationDto,
    UpdatePdfSectionLocalizationDto,
} from '@/types/admin/pdf-section';

export const PdfSectionLocalizationsApi = {
    create: async (
        client: AxiosInstance,
        data: CreatePdfSectionLocalizationDto,
    ): Promise<PdfSectionLocalizationDto> => {
        const response = await client.post<PdfSectionLocalizationDto>(API_ROUTES.PDF_SECTION_LOCALIZATIONS.BASE, data);
        return response.data;
    },

    update: async (
        client: AxiosInstance,
        languageId: number,
        data: UpdatePdfSectionLocalizationDto,
    ): Promise<PdfSectionLocalizationDto> => {
        const response = await client.put<PdfSectionLocalizationDto>(
            `${API_ROUTES.PDF_SECTION_LOCALIZATIONS.BASE}/${languageId}`,
            data,
        );
        return response.data;
    },
};
