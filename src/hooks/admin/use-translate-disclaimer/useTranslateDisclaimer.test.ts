import { renderHook, act, waitFor } from '@testing-library/react';
import { useTranslateDisclaimer } from './useTranslateDisclaimer';
import { ReportFundsExpendituresSettingsLocalizationsApi } from '@/services/api/admin/reports/report-funds-expenditures-settings-localizations/report-funds-expenditures-settings-localizations-api';
import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
import { LocalizationLanguage, TranslationStatus } from '@/types/common/language';
import { ReportFundsExpendituresSettings, ReportFundsExpendituresSettingsLocalization } from '@/types/admin/reports';
import { ModalMode } from '@/types/admin/common';

jest.mock(
    '@/services/api/admin/reports/report-funds-expenditures-settings-localizations/report-funds-expenditures-settings-localizations-api',
);
jest.mock('@/utils/functions/mappers/common/localization/localization-mappers');
jest.mock('../use-admin-client/useAdminClient', () => ({
    useAdminClient: () => ({ post: jest.fn(), put: jest.fn() }),
}));

const mockedCreate = ReportFundsExpendituresSettingsLocalizationsApi.create as jest.MockedFunction<
    typeof ReportFundsExpendituresSettingsLocalizationsApi.create
>;
const mockedUpdate = ReportFundsExpendituresSettingsLocalizationsApi.update as jest.MockedFunction<
    typeof ReportFundsExpendituresSettingsLocalizationsApi.update
>;
const mockedMapper = mapLocalizationDtoToModel as jest.MockedFunction<typeof mapLocalizationDtoToModel>;

const settingsMock: ReportFundsExpendituresSettings = {
    id: 1,
    disclaimerTitle: 'Original disclaimer',
    exchangeRate: null,
    programExpendituresReportingYear: 2025,
    hasUnpublishedChanges: false,
};

const languageMock: LocalizationLanguage = {
    id: 2,
    code: 'en',
    name: 'English',
};

const formValues = { description: 'Translated disclaimer' };

const localizationDtoMock = {
    entityId: 1,
    disclaimerTitle: 'Translated disclaimer',
    localizationInfoDto: { id: 2, code: 'en' },
    translationStatus: TranslationStatus.Relevant,
};

const localizationModelMock: ReportFundsExpendituresSettingsLocalization = {
    disclaimerTitle: 'Translated disclaimer',
    language: { id: 2, code: 'en' },
    translationStatus: TranslationStatus.Relevant,
};

describe('useTranslateDisclaimer', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize with default state', () => {
        const { result } = renderHook(() =>
            useTranslateDisclaimer({
                settings: settingsMock,
                language: languageMock,
                onSuccess: jest.fn(),
                mode: ModalMode.Add,
            }),
        );

        expect(result.current.isSubmitting).toBe(false);
        expect(result.current.error).toBe('');
    });

    it('should create translation successfully in add mode', async () => {
        const onSuccess = jest.fn();
        mockedCreate.mockResolvedValue(localizationDtoMock as any);
        mockedMapper.mockReturnValue(localizationModelMock);

        const { result } = renderHook(() =>
            useTranslateDisclaimer({
                settings: settingsMock,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Add,
            }),
        );

        await act(async () => {
            await result.current.translateDisclaimer(formValues);
        });

        expect(mockedCreate).toHaveBeenCalledWith(expect.anything(), {
            entityId: settingsMock.id,
            languageId: languageMock.id,
            disclaimerTitle: formValues.description,
        });
        expect(onSuccess).toHaveBeenCalledWith(localizationModelMock);
        expect(result.current.isSubmitting).toBe(false);
        expect(result.current.error).toBe('');
    });

    it('should update translation successfully in edit mode', async () => {
        const onSuccess = jest.fn();
        mockedUpdate.mockResolvedValue(localizationDtoMock as any);
        mockedMapper.mockReturnValue(localizationModelMock);

        const { result } = renderHook(() =>
            useTranslateDisclaimer({
                settings: settingsMock,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Edit,
            }),
        );

        await act(async () => {
            await result.current.translateDisclaimer(formValues);
        });

        expect(mockedUpdate).toHaveBeenCalledWith(expect.anything(), settingsMock.id, languageMock.id, {
            disclaimerTitle: formValues.description,
        });
        expect(onSuccess).toHaveBeenCalledWith(localizationModelMock);
    });

    it('should set error when create fails', async () => {
        const onSuccess = jest.fn();
        mockedCreate.mockRejectedValue(new Error('API error'));

        const { result } = renderHook(() =>
            useTranslateDisclaimer({
                settings: settingsMock,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Add,
            }),
        );

        await act(async () => {
            await result.current.translateDisclaimer(formValues);
        });

        await waitFor(() => {
            expect(result.current.error).toBe(FUNDS_EXPENDITURES_TEXT.MODAL.TRANSLATE_DISCLAIMER.FAIL_TO_TRANSLATE);
        });
        expect(onSuccess).not.toHaveBeenCalled();
        expect(result.current.isSubmitting).toBe(false);
    });

    it('should set error when update fails in edit mode', async () => {
        const onSuccess = jest.fn();
        mockedUpdate.mockRejectedValue(new Error('API error'));

        const { result } = renderHook(() =>
            useTranslateDisclaimer({
                settings: settingsMock,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Edit,
            }),
        );

        await act(async () => {
            await result.current.translateDisclaimer(formValues);
        });

        await waitFor(() => {
            expect(result.current.error).toBe(
                FUNDS_EXPENDITURES_TEXT.MODAL.TRANSLATE_DISCLAIMER.FAIL_TO_UPDATE_TRANSLATION,
            );
        });
        expect(onSuccess).not.toHaveBeenCalled();
    });

    it('should do nothing when settings is null', async () => {
        const onSuccess = jest.fn();

        const { result } = renderHook(() =>
            useTranslateDisclaimer({
                settings: null,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Add,
            }),
        );

        await act(async () => {
            await result.current.translateDisclaimer(formValues);
        });

        expect(mockedCreate).not.toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();
    });

    it('should do nothing when language is null', async () => {
        const onSuccess = jest.fn();

        const { result } = renderHook(() =>
            useTranslateDisclaimer({
                settings: settingsMock,
                language: null,
                onSuccess,
                mode: ModalMode.Add,
            }),
        );

        await act(async () => {
            await result.current.translateDisclaimer(formValues);
        });

        expect(mockedCreate).not.toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();
    });

    it('should clear error', () => {
        const { result } = renderHook(() =>
            useTranslateDisclaimer({
                settings: settingsMock,
                language: languageMock,
                onSuccess: jest.fn(),
                mode: ModalMode.Add,
            }),
        );

        act(() => {
            result.current.clearError();
        });

        expect(result.current.error).toBe('');
    });
});
