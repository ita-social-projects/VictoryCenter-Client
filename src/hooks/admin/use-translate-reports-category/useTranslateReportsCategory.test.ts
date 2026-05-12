import { renderHook, act, waitFor } from '@testing-library/react';
import { useTranslateReportsCategory } from './useTranslateReportsCategory';
import { ReportFundsExpendituresCategoryLocalizationsApi } from '@/services/api/admin/reports/report-funds-expenditures-category-localizations/report-funds-expenditures-category-localizations-api';
import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
import { LocalizationLanguage, TranslationStatus } from '@/types/common/language';
import { ReportFundsExpendituresCategory, ReportFundsExpendituresCategoryLocalization } from '@/types/admin/reports';
import { ModalMode } from '@/types/admin/common';

jest.mock(
    '@/services/api/admin/reports/report-funds-expenditures-category-localizations/report-funds-expenditures-category-localizations-api',
);
jest.mock('@/utils/functions/mappers/common/localization/localization-mappers');
jest.mock('../use-admin-client/useAdminClient', () => ({
    useAdminClient: () => ({ post: jest.fn(), put: jest.fn() }),
}));

const mockedCreate = ReportFundsExpendituresCategoryLocalizationsApi.create as jest.MockedFunction<
    typeof ReportFundsExpendituresCategoryLocalizationsApi.create
>;
const mockedUpdate = ReportFundsExpendituresCategoryLocalizationsApi.update as jest.MockedFunction<
    typeof ReportFundsExpendituresCategoryLocalizationsApi.update
>;
const mockedMapper = mapLocalizationDtoToModel as jest.MockedFunction<typeof mapLocalizationDtoToModel>;

const categoryMock: ReportFundsExpendituresCategory = {
    id: 1,
    name: 'Original category',
    type: 'income',
    localizations: [],
};

const languageMock: LocalizationLanguage = {
    id: 2,
    code: 'en',
    name: 'English',
};

const formValues = { name: 'Translated category' };

const localizationDtoMock = {
    entityId: 1,
    name: 'Translated category',
    localizationInfoDto: { id: 2, code: 'en' },
    translationStatus: TranslationStatus.Relevant,
};

const localizationModelMock: ReportFundsExpendituresCategoryLocalization = {
    name: 'Translated category',
    language: { id: 2, code: 'en' },
    translationStatus: TranslationStatus.Relevant,
};

describe('useTranslateReportsCategory', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize with default state', () => {
        const { result } = renderHook(() =>
            useTranslateReportsCategory({
                category: categoryMock,
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
            useTranslateReportsCategory({
                category: categoryMock,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Add,
            }),
        );

        act(() => {
            result.current.translateCategory(formValues);
        });

        await waitFor(() => expect(onSuccess).toHaveBeenCalled());

        expect(mockedCreate).toHaveBeenCalledWith(expect.anything(), {
            entityId: 1,
            languageId: 2,
            name: formValues.name,
        });
        expect(onSuccess).toHaveBeenCalledWith({
            ...categoryMock,
            localizations: [localizationModelMock],
        });
        expect(result.current.isSubmitting).toBe(false);
        expect(result.current.error).toBe('');
    });

    it('should update translation successfully in edit mode', async () => {
        const onSuccess = jest.fn();
        mockedUpdate.mockResolvedValue(localizationDtoMock as any);
        mockedMapper.mockReturnValue(localizationModelMock);

        const categoryWithLocalization: ReportFundsExpendituresCategory = {
            ...categoryMock,
            localizations: [{ ...localizationModelMock, language: languageMock }],
        };

        const { result } = renderHook(() =>
            useTranslateReportsCategory({
                category: categoryWithLocalization,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Edit,
            }),
        );

        await act(async () => {
            await result.current.translateCategory(formValues);
        });

        expect(mockedUpdate).toHaveBeenCalledWith(expect.anything(), categoryMock.id, languageMock.id, {
            name: formValues.name,
        });
        expect(onSuccess).toHaveBeenCalledWith({
            ...categoryWithLocalization,
            localizations: [localizationModelMock],
        });
    });

    it('should set error when create fails', async () => {
        const onSuccess = jest.fn();
        mockedCreate.mockRejectedValue(new Error('API error'));

        const { result } = renderHook(() =>
            useTranslateReportsCategory({
                category: categoryMock,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Add,
            }),
        );

        await act(async () => {
            await result.current.translateCategory(formValues);
        });

        await waitFor(() => {
            expect(result.current.error).toBe(FUNDS_EXPENDITURES_TEXT.MESSAGE.FAIL_TO_TRANSLATE_CATEGORY);
        });
        expect(onSuccess).not.toHaveBeenCalled();
        expect(result.current.isSubmitting).toBe(false);
    });

    it('should set error when update fails in edit mode', async () => {
        const onSuccess = jest.fn();
        mockedUpdate.mockRejectedValue(new Error('API error'));

        const { result } = renderHook(() =>
            useTranslateReportsCategory({
                category: categoryMock,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Edit,
            }),
        );

        await act(async () => {
            await result.current.translateCategory(formValues);
        });

        await waitFor(() => {
            expect(result.current.error).toBe(FUNDS_EXPENDITURES_TEXT.MESSAGE.FAIL_TO_UPDATE_CATEGORY_TRANSLATION);
        });
        expect(onSuccess).not.toHaveBeenCalled();
    });

    it('should do nothing when category is null', async () => {
        const onSuccess = jest.fn();

        const { result } = renderHook(() =>
            useTranslateReportsCategory({
                category: null,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Add,
            }),
        );

        await act(async () => {
            await result.current.translateCategory(formValues);
        });

        expect(mockedCreate).not.toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();
    });

    it('should do nothing when language is null', async () => {
        const onSuccess = jest.fn();

        const { result } = renderHook(() =>
            useTranslateReportsCategory({
                category: categoryMock,
                language: null,
                onSuccess,
                mode: ModalMode.Add,
            }),
        );

        await act(async () => {
            await result.current.translateCategory(formValues);
        });

        expect(mockedCreate).not.toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();
    });

    it('should clear error', () => {
        const { result } = renderHook(() =>
            useTranslateReportsCategory({
                category: categoryMock,
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
