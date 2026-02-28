import { renderHook, act, waitFor } from '@testing-library/react';
import { useTranslateFaq } from './useTranslateFaq';
import { FaqLocalizationsApi } from '@/services/api/admin/faq/faq-localizations/faq-localizations-api';
import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';
import { FAQ_TEXT } from '@/const/admin/faq';
import { LocalizationLanguage } from '@/types/common/language';
import { FaqQuestion, FaqLocalization } from '@/types/admin/faq';
import { ModalMode } from '@/types/admin/common';

jest.mock('@/services/api/admin/faq/faq-localizations/faq-localizations-api');
jest.mock('@/utils/functions/mappers/common/localization/localization-mappers');
jest.mock('../use-admin-client/useAdminClient', () => ({
    useAdminClient: () => ({ post: jest.fn() }),
}));

const mockedCreate = FaqLocalizationsApi.create as jest.MockedFunction<typeof FaqLocalizationsApi.create>;

const mockedUpdate = FaqLocalizationsApi.update as jest.MockedFunction<typeof FaqLocalizationsApi.update>;

const mockedMapper = mapLocalizationDtoToModel as jest.MockedFunction<typeof mapLocalizationDtoToModel>;

const faqMock: FaqQuestion = {
    id: 1,
    questionText: 'Original question',
    answerText: 'Original answer',
    status: 1 as any,
    pages: [],
    localizations: [],
};

const languageMock: LocalizationLanguage = {
    id: 2,
    code: 'en',
    name: 'English',
};

const formValues = {
    question: 'Translated question',
    answer: 'Translated answer',
};

const localizationDtoMock = {
    entityId: 1,
    localizationInfoDto: {
        id: 10,
        code: 'en',
    },
    questionText: 'Translated question',
    answerText: 'Translated answer',
    translationStatus: 1,
};

const localizationModelMock: FaqLocalization = {
    questionText: 'Translated question',
    answerText: 'Translated answer',
    language: {
        id: 2,
        code: 'en',
    },
    translationStatus: 1,
};

describe('useTranslateFaq', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize with default state', () => {
        const { result } = renderHook(() =>
            useTranslateFaq({
                faq: faqMock,
                language: languageMock,
                onSuccess: jest.fn(),
                mode: ModalMode.Add,
            }),
        );

        expect(result.current.isSubmitting).toBe(false);
        expect(result.current.error).toBe('');
    });

    it('should translate faq successfully', async () => {
        const onSuccess = jest.fn();

        mockedCreate.mockResolvedValue(localizationDtoMock as any);
        mockedMapper.mockReturnValue(localizationModelMock);

        const { result } = renderHook(() =>
            useTranslateFaq({
                faq: faqMock,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Add,
            }),
        );

        act(() => {
            result.current.translateFaq(formValues);
        });

        await waitFor(() => {
            expect(onSuccess).toHaveBeenCalled();
        });

        expect(mockedCreate).toHaveBeenCalledWith(expect.anything(), {
            entityId: 1,
            languageId: 2,
            questionText: formValues.question,
            answerText: formValues.answer,
        });

        expect(onSuccess).toHaveBeenCalledWith({
            ...faqMock,
            localizations: [localizationModelMock],
        });

        expect(result.current.isSubmitting).toBe(false);
        expect(result.current.error).toBe('');
    });

    it('should update translation successfully in edit mode', async () => {
        const onSuccess = jest.fn();

        mockedUpdate.mockResolvedValue(localizationDtoMock as any);
        mockedMapper.mockReturnValue(localizationModelMock);

        const faqWithLocalization: FaqQuestion = {
            ...faqMock,
            localizations: [
                {
                    ...localizationModelMock,
                    language: languageMock,
                },
            ],
        };

        const { result } = renderHook(() =>
            useTranslateFaq({
                faq: faqWithLocalization,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Edit,
            }),
        );

        await act(async () => {
            await result.current.translateFaq(formValues);
        });

        expect(mockedUpdate).toHaveBeenCalledWith(expect.anything(), faqMock.id, languageMock.id, {
            questionText: formValues.question,
            answerText: formValues.answer,
        });

        expect(onSuccess).toHaveBeenCalledWith({
            ...faqWithLocalization,
            localizations: [localizationModelMock],
        });
    });

    it('should set error when translation fails', async () => {
        const onSuccess = jest.fn();

        mockedCreate.mockRejectedValue(new Error('API error'));

        const { result } = renderHook(() =>
            useTranslateFaq({
                faq: faqMock,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Add,
            }),
        );

        await act(async () => {
            try {
                await result.current.translateFaq(formValues);
            } catch {
                // Ignoring error for test
            }
        });

        await waitFor(() => {
            expect(result.current.error).toBe(FAQ_TEXT.FORM?.MESSAGE?.FAIL_TO_TRANSLATE_FAQ);
        });

        expect(onSuccess).not.toHaveBeenCalled();
        expect(result.current.isSubmitting).toBe(false);
    });

    it('should set error when update fails in edit mode', async () => {
        const onSuccess = jest.fn();

        mockedUpdate.mockRejectedValue(new Error('API error'));

        const faqWithLocalization: FaqQuestion = {
            ...faqMock,
            localizations: [
                {
                    ...localizationModelMock,
                    language: languageMock,
                },
            ],
        };

        const { result } = renderHook(() =>
            useTranslateFaq({
                faq: faqWithLocalization,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Edit,
            }),
        );

        await act(async () => {
            try {
                await result.current.translateFaq(formValues);
            } catch {
                // Ignoring error for test
            }
        });

        await waitFor(() => {
            expect(result.current.error).toBe(FAQ_TEXT.FORM?.MESSAGE?.FAIL_TO_UPDATE_TRANSLATION);
        });

        expect(onSuccess).not.toHaveBeenCalled();
        expect(result.current.isSubmitting).toBe(false);
    });

    it('should clear error', () => {
        const { result } = renderHook(() =>
            useTranslateFaq({
                faq: faqMock,
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

    it('should do nothing if faq is null', async () => {
        const onSuccess = jest.fn();

        const { result } = renderHook(() =>
            useTranslateFaq({
                faq: null,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Add,
            }),
        );

        await act(async () => {
            await result.current.translateFaq(formValues);
        });

        expect(mockedCreate).not.toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();
    });
});
