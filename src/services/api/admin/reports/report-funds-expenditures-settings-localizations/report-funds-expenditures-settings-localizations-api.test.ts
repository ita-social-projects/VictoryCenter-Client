import { ReportFundsExpendituresSettingsLocalizationsApi } from './report-funds-expenditures-settings-localizations-api';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import {
    CreateReportFundsExpendituresSettingsLocalizationDto,
    ReportFundsExpendituresSettingsLocalizationDto,
    UpdateReportFundsExpendituresSettingsLocalizationDto,
} from '@/types/admin/reports';
import { TranslationStatus } from '@/types/common/language';

const mockLocalizationDto: ReportFundsExpendituresSettingsLocalizationDto = {
    entityId: 1,
    disclaimerTitle: 'Translated disclaimer',
    localizationInfoDto: { id: 2, code: 'en', name: 'English' },
    translationStatus: TranslationStatus.Relevant,
};

describe('ReportFundsExpendituresSettingsLocalizationsApi', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should call client.post with correct url and payload and return response data', async () => {
            const mockClient = { post: jest.fn().mockResolvedValueOnce({ data: mockLocalizationDto }) };

            const payload: CreateReportFundsExpendituresSettingsLocalizationDto = {
                entityId: 1,
                languageId: 2,
                disclaimerTitle: 'Translated disclaimer',
            };

            const result = await ReportFundsExpendituresSettingsLocalizationsApi.create(mockClient as any, payload);

            expect(mockClient.post).toHaveBeenCalledTimes(1);
            expect(mockClient.post).toHaveBeenCalledWith(
                API_ROUTES.REPORT_FUNDS_EXPENDITURES_SETTINGS_LOCALIZATIONS.BASE,
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
            const payload: UpdateReportFundsExpendituresSettingsLocalizationDto = {
                disclaimerTitle: 'Updated disclaimer',
            };

            const result = await ReportFundsExpendituresSettingsLocalizationsApi.update(
                mockClient as any,
                entityId,
                languageId,
                payload,
            );

            expect(mockClient.put).toHaveBeenCalledTimes(1);
            expect(mockClient.put).toHaveBeenCalledWith(
                `${API_ROUTES.REPORT_FUNDS_EXPENDITURES_SETTINGS_LOCALIZATIONS.BASE}/${entityId}/${languageId}`,
                payload,
            );
            expect(result).toEqual(mockLocalizationDto);
        });
    });
});
