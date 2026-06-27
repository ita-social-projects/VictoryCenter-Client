import { ReportFundsExpendituresCategoryLocalizationsApi } from './report-funds-expenditures-category-localizations-api';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import {
    CreateReportFundsExpendituresCategoryLocalizationDto,
    ReportFundsExpendituresCategoryLocalizationDto,
    UpdateReportFundsExpendituresCategoryLocalizationDto,
} from '@/types/admin/reports';
import { LocalizationInfo, TranslationStatus } from '@/types/common/language';

const mockLocalizationDto: ReportFundsExpendituresCategoryLocalizationDto = {
    entityId: 1,
    name: 'Translated name',
    localizationInfoDto: {
        id: 2,
        code: 'en',
        name: 'English',
    } as LocalizationInfo,
    translationStatus: TranslationStatus.Relevant,
};

describe('ReportFundsExpendituresCategoryLocalizationsApi', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should call client.post with correct url and payload and return response data', async () => {
            const mockClient = { post: jest.fn().mockResolvedValueOnce({ data: mockLocalizationDto }) };

            const payload: CreateReportFundsExpendituresCategoryLocalizationDto = {
                entityId: 1,
                languageId: 2,
                name: 'Translated name',
            };

            const result = await ReportFundsExpendituresCategoryLocalizationsApi.create(mockClient as any, payload);

            expect(mockClient.post).toHaveBeenCalledTimes(1);
            expect(mockClient.post).toHaveBeenCalledWith(
                API_ROUTES.REPORT_FUNDS_EXPENDITURES_CATEGORY_LOCALIZATIONS.BASE,
                payload,
            );
            expect(result).toEqual(mockLocalizationDto);
        });
    });

    describe('update', () => {
        it('should call client.put with correct url and payload and return response data', async () => {
            const mockClient = { put: jest.fn().mockResolvedValueOnce({ data: mockLocalizationDto }) };

            const entityId = 1;
            const languageId = 2;
            const payload: UpdateReportFundsExpendituresCategoryLocalizationDto = { name: 'Updated name' };

            const result = await ReportFundsExpendituresCategoryLocalizationsApi.update(
                mockClient as any,
                entityId,
                languageId,
                payload,
            );

            expect(mockClient.put).toHaveBeenCalledTimes(1);
            expect(mockClient.put).toHaveBeenCalledWith(
                `${API_ROUTES.REPORT_FUNDS_EXPENDITURES_CATEGORY_LOCALIZATIONS.BASE}/${entityId}/${languageId}`,
                payload,
            );
            expect(result).toEqual(mockLocalizationDto);
        });
    });
});
