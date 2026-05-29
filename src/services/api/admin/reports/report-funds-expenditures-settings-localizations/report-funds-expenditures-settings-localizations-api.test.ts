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
    localizationInfoDto: { id: 2, code: 'en' },
    translationStatus: TranslationStatus.Relevant,
};

describe('ReportFundsExpendituresSettingsLocalizationsApi', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getByEntityId', () => {
        it('should call client.get with correct url and return response data', async () => {
            const mockClient = { get: jest.fn().mockResolvedValueOnce({ data: [mockLocalizationDto] }) };

            const result = await ReportFundsExpendituresSettingsLocalizationsApi.getByEntityId(mockClient as any, 1);

            expect(mockClient.get).toHaveBeenCalledTimes(1);
            expect(mockClient.get).toHaveBeenCalledWith(
                `${API_ROUTES.REPORT_FUNDS_EXPENDITURES_SETTINGS_LOCALIZATIONS.BASE}/1`,
                { signal: undefined },
            );
            expect(result).toEqual([mockLocalizationDto]);
        });

        it('should forward the cancellation signal when provided', async () => {
            const controller = new AbortController();
            const mockClient = { get: jest.fn().mockResolvedValueOnce({ data: [] }) };

            await ReportFundsExpendituresSettingsLocalizationsApi.getByEntityId(mockClient as any, 2, {
                cancellationSignal: controller.signal,
            });

            expect(mockClient.get).toHaveBeenCalledWith(
                `${API_ROUTES.REPORT_FUNDS_EXPENDITURES_SETTINGS_LOCALIZATIONS.BASE}/2`,
                { signal: controller.signal },
            );
        });

        it('should return an empty array when the server returns no localizations', async () => {
            const mockClient = { get: jest.fn().mockResolvedValueOnce({ data: [] }) };

            const result = await ReportFundsExpendituresSettingsLocalizationsApi.getByEntityId(mockClient as any, 1);

            expect(result).toEqual([]);
        });
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
