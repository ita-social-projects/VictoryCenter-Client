import { renderHook, act, waitFor } from '@testing-library/react';
import { useTranslateTeamMember } from './useTranslateTeamMember';
import { TeamMemberLocalizationsApi } from '@/services/api/admin/team/team-member-localizations/team-member-localizations-api';
import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';
import { TEAM_MEMBERS_TEXT } from '@/const/admin/team';
import { LocalizationLanguage } from '@/types/common/language';
import { TeamMember, TeamMemberLocalization } from '@/types/admin/team-members';
import { ModalMode } from '@/types/admin/common';

jest.mock('@/services/api/admin/team/team-member-localizations/team-member-localizations-api');
jest.mock('@/utils/functions/mappers/common/localization/localization-mappers');
jest.mock('../use-admin-client/useAdminClient', () => ({
    useAdminClient: () => ({ post: jest.fn() }),
}));

const mockedCreate = TeamMemberLocalizationsApi.create as jest.MockedFunction<typeof TeamMemberLocalizationsApi.create>;

const mockedUpdate = TeamMemberLocalizationsApi.update as jest.MockedFunction<typeof TeamMemberLocalizationsApi.update>;

const mockedMapper = mapLocalizationDtoToModel as jest.MockedFunction<typeof mapLocalizationDtoToModel>;

const memberMock: TeamMember = {
    id: 1,
    fullName: 'Original name',
    description: 'Original description',
    image: null,
    status: 1 as any,
    categoryId: 2,
    localizations: [],
};

const languageMock: LocalizationLanguage = {
    id: 2,
    code: 'en',
    name: 'English',
};

const formValues = {
    fullName: 'Translated name',
    description: 'Translated description',
};

const localizationDtoMock = {
    entityId: 1,
    localizationInfoDto: {
        id: 10,
        code: 'en',
    },
    fullName: 'Translated name',
    description: 'Translated description',
    translationStatus: 1,
};

const localizationModelMock: TeamMemberLocalization = {
    fullName: 'Translated name',
    description: 'Translated description',
    language: {
        id: 2,
        code: 'en',
    },
    translationStatus: 1,
};

describe('useTranslateTeamMember', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize with default state', () => {
        const { result } = renderHook(() =>
            useTranslateTeamMember({
                member: memberMock,
                language: languageMock,
                onSuccess: jest.fn(),
                mode: ModalMode.Add,
            }),
        );

        expect(result.current.isSubmitting).toBe(false);
        expect(result.current.error).toBe('');
    });

    it('should translate member successfully', async () => {
        const onSuccess = jest.fn();

        mockedCreate.mockResolvedValue(localizationDtoMock as any);
        mockedMapper.mockReturnValue(localizationModelMock);

        const { result } = renderHook(() =>
            useTranslateTeamMember({
                member: memberMock,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Add,
            }),
        );

        act(() => {
            result.current.translateMember(formValues);
        });

        await waitFor(() => {
            expect(onSuccess).toHaveBeenCalled();
        });

        expect(mockedCreate).toHaveBeenCalledWith(expect.anything(), {
            entityId: 1,
            languageId: 2,
            fullName: formValues.fullName,
            description: formValues.description,
        });

        expect(onSuccess).toHaveBeenCalledWith({
            ...memberMock,
            localizations: [localizationModelMock],
        });

        expect(result.current.isSubmitting).toBe(false);
        expect(result.current.error).toBe('');
    });

    it('should update translation successfully in edit mode', async () => {
        const onSuccess = jest.fn();

        mockedUpdate.mockResolvedValue(localizationDtoMock as any);
        mockedMapper.mockReturnValue(localizationModelMock);

        const memberWithLocalization: TeamMember = {
            ...memberMock,
            localizations: [
                {
                    ...localizationModelMock,
                    language: languageMock,
                },
            ],
        };

        const { result } = renderHook(() =>
            useTranslateTeamMember({
                member: memberWithLocalization,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Edit,
            }),
        );

        await act(async () => {
            await result.current.translateMember(formValues);
        });

        expect(mockedUpdate).toHaveBeenCalledWith(expect.anything(), memberMock.id, languageMock.id, {
            fullName: formValues.fullName,
            description: formValues.description,
        });

        expect(onSuccess).toHaveBeenCalledWith({
            ...memberWithLocalization,
            localizations: [localizationModelMock],
        });
    });

    it('should set error when translation fails', async () => {
        const onSuccess = jest.fn();

        mockedCreate.mockRejectedValue(new Error('API error'));

        const { result } = renderHook(() =>
            useTranslateTeamMember({
                member: memberMock,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Add,
            }),
        );

        await act(async () => {
            try {
                await result.current.translateMember(formValues);
            } catch {
                // Ignoring error for test
            }
        });

        await waitFor(() => {
            expect(result.current.error).toBe(TEAM_MEMBERS_TEXT.FORM.MESSAGE.FAIL_TO_TRANSLATE_MEMBER);
        });

        expect(onSuccess).not.toHaveBeenCalled();
        expect(result.current.isSubmitting).toBe(false);
    });

    it('should set error when update fails in edit mode', async () => {
        const onSuccess = jest.fn();

        mockedUpdate.mockRejectedValue(new Error('API error'));

        const memberWithLocalization: TeamMember = {
            ...memberMock,
            localizations: [
                {
                    ...localizationModelMock,
                    language: languageMock,
                },
            ],
        };

        const { result } = renderHook(() =>
            useTranslateTeamMember({
                member: memberWithLocalization,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Edit,
            }),
        );

        await act(async () => {
            try {
                await result.current.translateMember(formValues);
            } catch {
                // Ignoring error for test
            }
        });

        await waitFor(() => {
            expect(result.current.error).toBe(TEAM_MEMBERS_TEXT.FORM.MESSAGE.FAIL_TO_UPDATE_TRANSLATION);
        });

        expect(onSuccess).not.toHaveBeenCalled();
        expect(result.current.isSubmitting).toBe(false);
    });

    it('should clear error', () => {
        const { result } = renderHook(() =>
            useTranslateTeamMember({
                member: memberMock,
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

    it('should do nothing if member is null', async () => {
        const onSuccess = jest.fn();

        const { result } = renderHook(() =>
            useTranslateTeamMember({
                member: null,
                language: languageMock,
                onSuccess,
                mode: ModalMode.Add,
            }),
        );

        await act(async () => {
            await result.current.translateMember(formValues);
        });

        expect(mockedCreate).not.toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();
    });
});
