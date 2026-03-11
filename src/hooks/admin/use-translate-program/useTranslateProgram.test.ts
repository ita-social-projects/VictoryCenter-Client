import { renderHook, act, waitFor } from '@testing-library/react';
import { useTranslateProgram } from './useTranslateProgram';
import { ProgramLocalizationsApi } from '@/services/api/admin/programs/program-localizations/program-localizations-api';
import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';
import { PROGRAMS_TEXT } from '@/const/admin/programs';
import { LocalizationLanguage } from '@/types/common/language';
import { HippotherapyProgram, HippotherapyProgramLocalization } from '@/types/admin/programs';
import { ModalMode } from '@/types/admin/common';

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
});
