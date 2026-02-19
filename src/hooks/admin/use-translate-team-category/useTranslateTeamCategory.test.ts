import { renderHook, act, waitFor } from '@testing-library/react';
import { useTranslateTeamCategory } from './useTranslateTeamCategory';
import { TeamCategoryLocalizationApi } from '@/services/api/admin/team/team-category-localizations/team-category-localizations-api';
import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';
import { TEAM_CATEGORY_TEXT } from '@/const/admin/team';
import { LocalizationLanguage } from '@/types/common/language';
import { TeamCategory, TeamCategoryLocalization } from '@/types/admin/team-category';
import { ModalMode } from '@/types/admin/common';

jest.mock('@/services/api/admin/team/team-category-localizations/team-category-localizations-api');
jest.mock('@/utils/functions/mappers/common/localization/localization-mappers');
jest.mock('../use-admin-client/useAdminClient', () => ({
    useAdminClient: () => ({ post: jest.fn() }),
}));

const mockedCreate = TeamCategoryLocalizationApi.create as jest.MockedFunction<
    typeof TeamCategoryLocalizationApi.create
>;
const mockedUpdate = TeamCategoryLocalizationApi.update as jest.MockedFunction<
    typeof TeamCategoryLocalizationApi.update
>;
const mockedMapper = mapLocalizationDtoToModel as jest.MockedFunction<typeof mapLocalizationDtoToModel>;

const teamCategoryMock: TeamCategory = {
    id: 1,
    name: 'Original category name',
    description: 'Original category description',
    localizations: [],
    teamMembersCount: 3,
};

const languageMock: LocalizationLanguage = {
    id: 2,
    code: 'en',
    name: 'English',
};

const formValues = {
    name: 'Translated category name',
    description: 'Translated category description',
};

const localizationDtoMock = {
    entityId: 1,
    localizationInfoDto: {
        id: 10,
        code: 'en',
    },
    name: 'Translated category name',
    description: 'Translated category description',
    translationStatus: 1,
};

const localizationModelMock: TeamCategoryLocalization = {
    name: 'Translated category name',
    description: 'Translated category description',
    language: {
        id: 2,
        code: 'en',
    },
    translationStatus: 1,
};

describe('useTranslateTeamCategory', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize with default state', () => {
        const { result } = renderHook(() =>
            useTranslateTeamCategory({
                teamCategory: teamCategoryMock,
                language: languageMock,
                onSuccess: jest.fn(),
                mode: ModalMode.Add,
            }),
        );

        expect(result.current.isSubmitting).toBe(false);
        expect(result.current.error).toBe('');
    });

    it('should translate team category successfully', async () => {
        const onSuccess = jest.fn();

        mockedCreate.mockResolvedValue(localizationDtoMock as any);
        mockedMapper.mockReturnValue(localizationModelMock);

        const { result } = renderHook(() =>
            useTranslateTeamCategory({
                teamCategory: teamCategoryMock,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Add,
            }),
        );

        act(() => {
            result.current.translateTeamCategory(formValues);
        });

        await waitFor(() => {
            expect(onSuccess).toHaveBeenCalled();
        });

        expect(mockedCreate).toHaveBeenCalledWith(expect.anything(), {
            entityId: 1,
            languageId: 2,
            name: formValues.name,
            description: formValues.description,
        });

        expect(onSuccess).toHaveBeenCalledWith({
            ...teamCategoryMock,
            localizations: [localizationModelMock],
        });

        expect(result.current.isSubmitting).toBe(false);
        expect(result.current.error).toBe('');
    });

    it('should update translation successfully in edit mode', async () => {
        const onSuccess = jest.fn();

        mockedUpdate.mockResolvedValue(localizationDtoMock as any);
        mockedMapper.mockReturnValue(localizationModelMock);

        const teamCategoryWithLocalization: TeamCategory = {
            ...teamCategoryMock,
            localizations: [
                {
                    ...localizationModelMock,
                    language: languageMock,
                },
            ],
        };

        const { result } = renderHook(() =>
            useTranslateTeamCategory({
                teamCategory: teamCategoryWithLocalization,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Edit,
            }),
        );

        await act(async () => {
            await result.current.translateTeamCategory(formValues);
        });

        expect(mockedUpdate).toHaveBeenCalledWith(expect.anything(), teamCategoryMock.id, languageMock.id, {
            name: formValues.name,
            description: formValues.description,
        });

        expect(onSuccess).toHaveBeenCalledWith({
            ...teamCategoryWithLocalization,
            localizations: [localizationModelMock],
        });
    });

    it('should set error when translation fails', async () => {
        const onSuccess = jest.fn();

        mockedCreate.mockRejectedValue(new Error('API error'));

        const { result } = renderHook(() =>
            useTranslateTeamCategory({
                teamCategory: teamCategoryMock,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Add,
            }),
        );

        await act(async () => {
            try {
                await result.current.translateTeamCategory(formValues);
            } catch {
                // Ignoring error for test
            }
        });

        await waitFor(() => {
            expect(result.current.error).toBe(TEAM_CATEGORY_TEXT.FORM.MESSAGE.FAIL_TO_TRANSLATE_TEAM_CATEGORY);
        });

        expect(onSuccess).not.toHaveBeenCalled();
        expect(result.current.isSubmitting).toBe(false);
    });

    it('should set error when update fails in edit mode', async () => {
        const onSuccess = jest.fn();

        mockedUpdate.mockRejectedValue(new Error('API error'));

        const teamCategoryWithLocalization: TeamCategory = {
            ...teamCategoryMock,
            localizations: [
                {
                    ...localizationModelMock,
                    language: languageMock,
                },
            ],
        };

        const { result } = renderHook(() =>
            useTranslateTeamCategory({
                teamCategory: teamCategoryWithLocalization,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Edit,
            }),
        );

        await act(async () => {
            try {
                await result.current.translateTeamCategory(formValues);
            } catch {
                // Ignoring error for test
            }
        });

        await waitFor(() => {
            expect(result.current.error).toBe(
                TEAM_CATEGORY_TEXT.FORM.MESSAGE.FAIL_TO_UPDATE_TRANSLATION_FOR_TEAM_CATEGORY,
            );
        });

        expect(onSuccess).not.toHaveBeenCalled();
        expect(result.current.isSubmitting).toBe(false);
    });

    it('should clear error', () => {
        const { result } = renderHook(() =>
            useTranslateTeamCategory({
                teamCategory: teamCategoryMock,
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

    it('should do nothing if teamCategory is null', async () => {
        const onSuccess = jest.fn();

        const { result } = renderHook(() =>
            useTranslateTeamCategory({
                teamCategory: null,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Add,
            }),
        );

        await act(async () => {
            await result.current.translateTeamCategory(formValues);
        });

        expect(mockedCreate).not.toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();
    });
});
