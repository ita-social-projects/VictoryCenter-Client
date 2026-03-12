import { renderHook, act, waitFor } from '@testing-library/react';
import { useTranslateProgram } from './useTranslateProgram';
import { shouldIncludeContent } from './useTranslateProgram';
import { ProgramLocalizationsApi } from '@/services/api/admin/programs/program-localizations/program-localizations-api';
import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';
import { PROGRAMS_TEXT } from '@/const/admin/programs';
import { LocalizationLanguage } from '@/types/common/language';
import { HippotherapyProgram, HippotherapyProgramLocalization } from '@/types/admin/programs';
import { ModalMode } from '@/types/admin/common';
import { ContentType } from '@/types/common/programs';

jest.mock('@/services/api/admin/programs/program-localizations/program-localizations-api');
jest.mock('@/utils/functions/mappers/common/localization/localization-mappers');
jest.mock('../use-admin-client/useAdminClient', () => ({
    useAdminClient: () => ({ post: jest.fn() }),
}));

const mockedCreate = ProgramLocalizationsApi.create as jest.MockedFunction<typeof ProgramLocalizationsApi.create>;
const mockedUpdate = ProgramLocalizationsApi.update as jest.MockedFunction<typeof ProgramLocalizationsApi.update>;
const mockedMapper = mapLocalizationDtoToModel as jest.MockedFunction<typeof mapLocalizationDtoToModel>;

const programMock: HippotherapyProgram = {
    id: 1,
    name: 'Original name',
    description: 'Orig desc',
    categories: [],
    status: 1 as any,
    previewImage: null,
    backgroundImage: null,
    location: '',
    participantsCount: '',
    meetingsCount: '',
    sections: [],
    slug: '',
    localizations: [],
};

const languageMock: LocalizationLanguage = {
    id: 2,
    code: 'en',
    name: 'English',
};

const formValues = {
    name: 'Translated name',
    description: 'Trans desc',
    location: 'New loc',
    participantsCount: '10',
    meetingCount: '5',
    sections: [],
};

const localizationDtoMock = {
    entityId: 1,
    localizationInfoDto: {
        id: 2,
        code: 'en',
    },
    name: 'Translated name',
    description: 'Trans desc',
    location: 'New loc',
    participantsCount: '10',
    meetingsCount: '5',
    sections: [],
};

const localizationModelMock: HippotherapyProgramLocalization = {
    name: 'Translated name',
    description: 'Trans desc',
    location: 'New loc',
    participantsCount: '10',
    meetingsCount: '5',
    language: {
        id: 2,
        code: 'en',
    },
    translationStatus: 0, // e.g. TranslationStatus.Outdated
};

describe('useTranslateProgram', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('initializes with default state', () => {
        const { result } = renderHook(() =>
            useTranslateProgram({
                program: programMock,
                language: languageMock,
                onSuccess: jest.fn(),
                mode: ModalMode.Add,
            }),
        );

        expect(result.current.isSubmitting).toBe(false);
        expect(result.current.error).toBe('');
    });

    it('creates localization successfully', async () => {
        const onSuccess = jest.fn();

        mockedCreate.mockResolvedValue(localizationDtoMock as any);
        mockedMapper.mockReturnValue(localizationModelMock);

        const { result } = renderHook(() =>
            useTranslateProgram({
                program: programMock,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Add,
            }),
        );

        act(() => {
            result.current.translateProgram(formValues);
        });

        await waitFor(() => {
            expect(onSuccess).toHaveBeenCalled();
        });

        expect(mockedCreate).toHaveBeenCalledWith(expect.anything(), {
            entityId: 1,
            languageId: 2,
            name: formValues.name,
            description: formValues.description,
            location: formValues.location,
            participantsCount: formValues.participantsCount,
            meetingsCount: formValues.meetingCount,
            sections: formValues.sections,
        });

        expect(onSuccess).toHaveBeenCalledWith({
            ...programMock,
            localizations: [localizationModelMock],
        });

        expect(result.current.isSubmitting).toBe(false);
        expect(result.current.error).toBe('');
    });

    it('updates localization successfully in edit mode', async () => {
        const onSuccess = jest.fn();
        const existingLocalization = {
            ...localizationModelMock,
            name: 'Existing translated name',
            language: {
                id: languageMock.id,
                code: languageMock.code,
            },
        } as HippotherapyProgramLocalization;

        const programWithLocalization: HippotherapyProgram = {
            ...programMock,
            localizations: [existingLocalization],
        };

        mockedUpdate.mockResolvedValue(localizationDtoMock as any);
        mockedMapper.mockReturnValue(localizationModelMock);

        const { result } = renderHook(() =>
            useTranslateProgram({
                program: programWithLocalization,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Edit,
            }),
        );

        await act(async () => {
            await result.current.translateProgram(formValues);
        });

        expect(mockedUpdate).toHaveBeenCalledWith(expect.anything(), 1, 2, {
            name: formValues.name,
            description: formValues.description,
            location: formValues.location,
            participantsCount: formValues.participantsCount,
            meetingsCount: formValues.meetingCount,
            sections: formValues.sections,
        });

        expect(onSuccess).toHaveBeenCalledWith({
            ...programWithLocalization,
            localizations: [localizationModelMock],
        });

        expect(result.current.error).toBe('');
        expect(result.current.isSubmitting).toBe(false);
    });

    it('sets update error message when edit request fails', async () => {
        const onSuccess = jest.fn();

        mockedUpdate.mockRejectedValue(new Error('Request failed'));

        const { result } = renderHook(() =>
            useTranslateProgram({
                program: programMock,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Edit,
            }),
        );

        await act(async () => {
            await expect(result.current.translateProgram(formValues)).rejects.toThrow('Request failed');
        });

        expect(result.current.error).toBe(PROGRAMS_TEXT.FORM.MESSAGE.FAIL_TO_UPDATE_PROGRAM);
    });

    it('returns early when program is null', async () => {
        const onSuccess = jest.fn();

        const { result } = renderHook(() =>
            useTranslateProgram({
                program: null,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Add,
            }),
        );

        await act(async () => {
            await result.current.translateProgram(formValues);
        });

        expect(mockedCreate).not.toHaveBeenCalled();
        expect(mockedUpdate).not.toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();
        expect(result.current.isSubmitting).toBe(false);
    });

    it('sets create error message and clearError resets it', async () => {
        mockedCreate.mockRejectedValue(new Error('Create failed'));

        const { result } = renderHook(() =>
            useTranslateProgram({
                program: programMock,
                language: languageMock,
                onSuccess: jest.fn(),
                mode: ModalMode.Add,
            }),
        );

        await act(async () => {
            await expect(result.current.translateProgram(formValues)).rejects.toThrow('Create failed');
        });

        expect(result.current.error).toBe(PROGRAMS_TEXT.FORM.MESSAGE.FAIL_TO_CREATE_PROGRAM);

        act(() => {
            result.current.clearError();
        });

        expect(result.current.error).toBe('');
    });

    it('sanitizes section contents before create payload', async () => {
        const onSuccess = jest.fn();

        mockedCreate.mockResolvedValue(localizationDtoMock as any);
        mockedMapper.mockReturnValue(localizationModelMock);

        const sectionWithSource = {
            entityId: 42,
            __sourceSection: {
                contents: [
                    { id: 1, contentType: ContentType.Image, image: { url: '/img.jpg' } },
                    { id: 2, contentType: ContentType.Title, title: 'Only title' },
                    { id: 3, contentType: ContentType.Title, title: 't', description: 'd' },
                    { id: 5, contentType: ContentType.Description, title: null, description: '   ', author: null },
                    { id: 6, contentType: ContentType.FaqQuestion, faqQuestionId: 99 },
                ],
            },
            contents: [
                { entityId: 1, title: 'image title', description: 'image desc' },
                { entityId: 2, title: 'keep me', description: null },
                { entityId: 3, title: 'drop me', description: 'drop me too' },
                { entityId: 4, title: 'no source content, keep me', description: null },
                { entityId: 5, title: null, description: 'drop empty source' },
                { entityId: 6, question: 'Q?', answer: 'A!' },
            ],
        };

        const { result } = renderHook(() =>
            useTranslateProgram({
                program: programMock,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Add,
            }),
        );

        await act(async () => {
            await result.current.translateProgram({
                ...formValues,
                sections: [sectionWithSource] as any,
            });
        });

        expect(mockedCreate).toHaveBeenCalledTimes(1);

        const createPayload = mockedCreate.mock.calls[0][1] as {
            sections: Array<{ contents: Array<{ entityId: number; languageId: number; title?: string | null }> }>;
        };

        expect(createPayload.sections[0].contents.map((c) => c.entityId)).toEqual([2, 4, 6]);
        expect(createPayload.sections[0].contents.every((c) => c.languageId === languageMock.id)).toBe(true);
        expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    it('filters mixed-field content by contentType switch rules', async () => {
        mockedCreate.mockResolvedValue(localizationDtoMock as any);
        mockedMapper.mockReturnValue(localizationModelMock);

        const sectionWithMixedContentTypes = {
            entityId: 88,
            __sourceSection: {
                contents: [
                    { id: 10, contentType: ContentType.Description, title: 't', description: 'd' },
                    { id: 11, contentType: ContentType.Author, title: 't', author: 'a' },
                    { id: 12, contentType: ContentType.FaqQuestion, faqQuestionId: 200, author: 'a' },
                    { id: 13, contentType: 999, title: 't', description: 'd' },
                    { id: 14, contentType: ContentType.Description, description: 'valid description only' },
                ],
            },
            contents: [
                { entityId: 10, description: 'drop by Description rule' },
                { entityId: 11, author: 'drop by Author rule' },
                { entityId: 12, question: 'drop by FaqQuestion rule', answer: 'x' },
                { entityId: 13, description: 'drop by default rule' },
                { entityId: 14, description: 'keep this one' },
            ],
        };

        const { result } = renderHook(() =>
            useTranslateProgram({
                program: programMock,
                language: languageMock,
                onSuccess: jest.fn(),
                mode: ModalMode.Add,
            }),
        );

        await act(async () => {
            await result.current.translateProgram({
                ...formValues,
                sections: [sectionWithMixedContentTypes] as any,
            });
        });

        const createPayload = mockedCreate.mock.calls[mockedCreate.mock.calls.length - 1][1] as {
            sections: Array<{ contents: Array<{ entityId: number }> }>;
        };

        expect(createPayload.sections[0].contents.map((c) => c.entityId)).toEqual([14]);
    });

    it('uses fallback localization array in edit mode when program has no localizations', async () => {
        const onSuccess = jest.fn();

        mockedUpdate.mockResolvedValue(localizationDtoMock as any);
        mockedMapper.mockReturnValue(localizationModelMock);

        const programWithoutLocalizations: HippotherapyProgram = {
            ...programMock,
            localizations: undefined as any,
        };

        const { result } = renderHook(() =>
            useTranslateProgram({
                program: programWithoutLocalizations,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Edit,
            }),
        );

        await act(async () => {
            await result.current.translateProgram(formValues);
        });

        expect(onSuccess).toHaveBeenCalledWith({
            ...programWithoutLocalizations,
            localizations: [localizationModelMock],
        });
    });
});

describe('shouldIncludeContent', () => {
    it('returns true when source content is not found', () => {
        const sourceSection = { contents: [{ id: 1, contentType: ContentType.Title, title: 'Title' }] };
        expect(shouldIncludeContent(sourceSection, { entityId: 999 })).toBe(true);
    });

    it('returns false for image source content', () => {
        const sourceSection = { contents: [{ id: 2, contentType: ContentType.Image, imageId: 10 }] };
        expect(shouldIncludeContent(sourceSection, { entityId: 2 })).toBe(false);
    });

    it('returns false when all translatable fields are empty', () => {
        const sourceSection = {
            contents: [{ id: 3, contentType: ContentType.Description, title: '', description: '   ', author: null }],
        };
        expect(shouldIncludeContent(sourceSection, { entityId: 3 })).toBe(false);
    });

    it('returns false when multiple fields exist but do not match contentType rules', () => {
        const sourceSection = {
            contents: [{ id: 4, contentType: ContentType.Title, title: 'T', description: 'D' }],
        };
        expect(shouldIncludeContent(sourceSection, { entityId: 4 })).toBe(false);
    });

    it('returns true for valid faq question content', () => {
        const sourceSection = {
            contents: [{ id: 5, contentType: ContentType.FaqQuestion, faqQuestionId: 15 }],
        };
        expect(shouldIncludeContent(sourceSection, { entityId: 5 })).toBe(true);
    });
});
