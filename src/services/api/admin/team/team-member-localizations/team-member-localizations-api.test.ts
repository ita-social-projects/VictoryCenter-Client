import { AxiosInstance } from 'axios';
import { TeamMemberLocalizationsApi } from './team-member-localizations-api';
import { API_ROUTES } from '../../../../../const/common/api-routes/main-api';
import {
    TeamMemberLocalization,
    TeamMemberLocalizationCreateRequest,
    TeamMemberLocalizationUpdateRequest,
} from '../../../../../types/admin/localization/team-members';

describe('TeamMemberLocalizationsApi', () => {
    const mockClient = {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
    } as unknown as jest.Mocked<AxiosInstance>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('delete', () => {
        it('calls client.delete with correct URL', async () => {
            mockClient.delete.mockResolvedValue({});

            await TeamMemberLocalizationsApi.delete(mockClient, 55);

            expect(mockClient.delete).toHaveBeenCalledWith(`${API_ROUTES.TEAM_LOCALIZATIONS.BASE}/55`);
        });
    });

    describe('updateMemberLocalization', () => {
        it('calls client.put with correct payload and returns response data', async () => {
            const mockLocalization: TeamMemberLocalizationUpdateRequest = {
                id: 1,
                fullName: 'Updated Name',
                description: 'Updated description',
            };

            const mockResponse = {
                data: {
                    id: 1,
                    fullName: mockLocalization.fullName,
                    description: mockLocalization.description,
                    categoryId: 1,
                    imageId: 2,
                },
            };

            mockClient.put.mockResolvedValue(mockResponse);

            const result = await TeamMemberLocalizationsApi.updateMemberLocalization(mockClient, 1, mockLocalization);

            expect(mockClient.put).toHaveBeenCalledWith(`${API_ROUTES.TEAM_LOCALIZATIONS.BASE}/1`, {
                fullName: mockLocalization.fullName,
                description: mockLocalization.description,
            });

            expect(result).toEqual(mockResponse.data);
        });

        it('propagates errors from client.put', async () => {
            const mockError = new Error('Network error');
            mockClient.put.mockRejectedValue(mockError);

            await expect(
                TeamMemberLocalizationsApi.updateMemberLocalization(mockClient, 5, {
                    id: 1,
                    fullName: 'X',
                    description: 'Y',
                }),
            ).rejects.toThrow('Network error');
        });
    });

    describe('postMemberLocalization', () => {
        it('calls client.post with correct payload and returns response data', async () => {
            const mockLocalization: TeamMemberLocalizationCreateRequest = {
                fullName: 'Localized Name',
                description: 'Localized Description',
                teamMemberId: 10,
                languageId: 2,
            };

            const mockResponse = {
                data: {
                    id: 1,
                    fullName: mockLocalization.fullName,
                    description: mockLocalization.description,
                    teamMemberId: mockLocalization.teamMemberId,
                    localizationLanguage: { id: 2, code: 'en' },
                },
            };

            mockClient.post.mockResolvedValue(mockResponse);

            const result = await TeamMemberLocalizationsApi.postMemberLocalization(mockClient, mockLocalization);

            expect(mockClient.post).toHaveBeenCalledWith(`${API_ROUTES.TEAM_LOCALIZATIONS.BASE}`, {
                fullName: mockLocalization.fullName,
                description: mockLocalization.description,
                teamMemberId: mockLocalization.teamMemberId,
                languageId: mockLocalization.languageId,
            });

            expect(result).toEqual(mockResponse.data as TeamMemberLocalization);
        });

        it('throws error if request fails', async () => {
            const mockError = new Error('Bad request');
            mockClient.post.mockRejectedValue(mockError);

            await expect(
                TeamMemberLocalizationsApi.postMemberLocalization(mockClient, {
                    fullName: 'Bad',
                    description: 'Fail',
                    teamMemberId: 1,
                    languageId: 1,
                }),
            ).rejects.toThrow('Bad request');
        });
    });
});
