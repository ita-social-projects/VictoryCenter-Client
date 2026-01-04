import { TeamMemberLocalizationsApi } from './team-member-localizations-api';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { CreateTeamMemberLocalizationDto, TeamMemberLocalizationDto } from '@/types/admin/team-members';
import { LocalizationInfo, TranslationStatus } from '@/types/common/language';

describe('TeamMemberLocalizationsApi.create', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call client.post with correct url and payload and return response data', async () => {
        const mockClient = {
            post: jest.fn(),
        };

        const payload: CreateTeamMemberLocalizationDto = {
            entityId: 1,
            languageId: 2,
            fullName: 'John Doe',
            description: 'Translated description',
        };

        const mockResponseData: TeamMemberLocalizationDto = {
            entityId: 10,
            fullName: 'John Doe',
            description: 'Translated description',
            localizationInfoDto: {
                id: 2,
                code: 'en',
                name: 'English',
            } as LocalizationInfo,
            translationStatus: TranslationStatus.Relevant,
        };

        mockClient.post.mockResolvedValueOnce({
            data: mockResponseData,
        });

        const result = await TeamMemberLocalizationsApi.create(mockClient as any, payload);

        expect(mockClient.post).toHaveBeenCalledTimes(1);
        expect(mockClient.post).toHaveBeenCalledWith(API_ROUTES.TEAM_MEMBER_LOCALIZATIONS.BASE, payload);
        expect(result).toEqual(mockResponseData);
    });
});
