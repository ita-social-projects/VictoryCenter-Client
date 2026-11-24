import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { axiosInstance } from '@/services/api/axios';
import { RequestOptions } from '@/types/common/api';
import { PublicPdfSectionDto } from '@/types/public/reports';

export const PdfSectionPublicApi = {
    get: async (options: RequestOptions = {}): Promise<PublicPdfSectionDto> => {
        const response = await axiosInstance.get<PublicPdfSectionDto>(API_ROUTES.PDF_SECTION.PUBLIC, {
            signal: options.cancellationSignal,
        });

        return response.data;
    },
};
