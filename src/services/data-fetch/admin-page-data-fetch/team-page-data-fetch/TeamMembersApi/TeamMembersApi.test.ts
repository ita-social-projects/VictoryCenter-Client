import { AxiosInstance } from 'axios';
import { MemberFormValues } from '../../../../../pages/admin/team/components/member-form/MemberForm';
import { TeamMemberDto } from '../../../../../types/admin/TeamMembers';
import { mapTeamMemberDtoToTeamMember, TeamMembersApi } from './TeamMembersApi';
import { Image, ImageValues } from '../../../../../types/Image';
import { VisibilityStatus } from '../../../../../types/admin/Common';
import { ImagesApi } from '../../image-data-fetch/ImageDataApi';

const mockClient = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
} as unknown as jest.Mocked<AxiosInstance>;

jest.mock('../../image-data-fetch/ImageDataApi', () => ({
    ImagesApi: {
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
    },
}));

const mockImageValues: ImageValues = {
    base64: 'base64-string-for-new-image',
    mimeType: 'image/png',
    size: 0,
};

const mockImageResponse: Image = {
    id: 1,
    base64: 'base64-string-for-new-image',
    mimeType: 'image/png',
    size: 0,
};

describe('TeamMembersApi', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAll', () => {
        it('should fetch and map team members with no parameters', async () => {
            const mockDto: TeamMemberDto[] = [
                {
                    id: 1,
                    fullName: 'Test Member',
                    category: { id: 1, name: 'Core', description: 'desc' },
                    priority: 1,
                    status: 1,
                    description: 'Test desc',
                    image: mockImageResponse,
                    email: 'test@example.com',
                },
            ];
            mockClient.get.mockResolvedValue({ data: mockDto });

            const members = await TeamMembersApi.getAll(mockClient);

            expect(mockClient.get).toHaveBeenCalledWith('/TeamMembers', { params: {} });
            expect(members).toEqual([
                {
                    id: 1,
                    img: mockImageResponse,
                    fullName: 'Test Member',
                    description: 'Test desc',
                    status: 'Опубліковано',
                    category: { id: 1, name: 'Core', description: 'desc' },
                },
            ]);
        });

        it('should send GET request with all query parameters', async () => {
            const params = { categoryId: 3, status: VisibilityStatus.Published, offset: 10, limit: 5 };
            mockClient.get.mockResolvedValue({ data: [] });

            await TeamMembersApi.getAll(mockClient, params.categoryId, params.status, params.offset, params.limit);

            expect(mockClient.get).toHaveBeenCalledWith('/TeamMembers', {
                params: {
                    categoryId: params.categoryId,
                    status: params.status,
                    offset: params.offset,
                    limit: params.limit,
                },
            });
        });

        it('should return an empty array when the API sends an empty list', async () => {
            mockClient.get.mockResolvedValue({ data: [] });
            const members = await TeamMembersApi.getAll(mockClient);
            expect(members).toEqual([]);
        });

        it('should throw an error when the API request fails', async () => {
            const apiError = { response: { status: 500, data: 'Server error' } };
            mockClient.get.mockRejectedValue(apiError);
            await expect(TeamMembersApi.getAll(mockClient)).rejects.toMatchObject(apiError);
        });
    });

    describe('post', () => {
        const memberValues: MemberFormValues = {
            fullName: 'New Member',
            category: { id: 1, name: 'Основна команда', description: 'Test' },
            description: 'A new description',
            image: null,
            imageId: null,
        };

        it('should post member as draft without an image', async () => {
            await TeamMembersApi.postDraft(mockClient, memberValues);

            expect(mockClient.post).toHaveBeenCalledWith('/TeamMembers', {
                fullName: memberValues.fullName,
                categoryId: memberValues.category.id,
                status: VisibilityStatus.Draft,
                description: memberValues.description,
                email: '',
                imageId: null,
            });
            expect(ImagesApi.post).not.toHaveBeenCalled();
        });

        it('should post member as draft and create an image', async () => {
            (ImagesApi.post as jest.Mock).mockResolvedValue(mockImageResponse);
            const memberWithImage = { ...memberValues, image: mockImageValues };

            await TeamMembersApi.postDraft(mockClient, memberWithImage);

            expect(ImagesApi.post).toHaveBeenCalledWith(mockClient, mockImageValues);
            expect(mockClient.post).toHaveBeenCalledWith('/TeamMembers', {
                fullName: memberValues.fullName,
                categoryId: memberValues.category.id,
                status: VisibilityStatus.Draft,
                description: memberValues.description,
                email: '',
                imageId: mockImageResponse.id,
            });
        });

        it('should post member as published and create an image', async () => {
            (ImagesApi.post as jest.Mock).mockResolvedValue(mockImageResponse);
            const memberWithImage = { ...memberValues, image: mockImageValues };

            await TeamMembersApi.postPublished(mockClient, memberWithImage);

            expect(ImagesApi.post).toHaveBeenCalledWith(mockClient, mockImageValues);
            expect(mockClient.post).toHaveBeenCalledWith('/TeamMembers', {
                fullName: memberValues.fullName,
                categoryId: memberValues.category.id,
                status: VisibilityStatus.Published,
                description: memberValues.description,
                email: '',
                imageId: mockImageResponse.id,
            });
        });
    });

    describe('update', () => {
        const memberId = 5;
        const memberValues: MemberFormValues = {
            fullName: 'Updated Member',
            category: { id: 2, name: 'Інша команда', description: 'Test' },
            description: 'An updated description',
            image: null,
            imageId: null,
        };

        it('should update member as draft without changing the image', async () => {
            const memberWithExistingImage = { ...memberValues, imageId: 10 };

            await TeamMembersApi.updateDraft(mockClient, memberId, memberWithExistingImage);

            expect(mockClient.put).toHaveBeenCalledWith(`/TeamMembers/${memberId}`, {
                fullName: memberWithExistingImage.fullName,
                categoryId: memberWithExistingImage.category.id,
                status: VisibilityStatus.Draft,
                description: memberWithExistingImage.description,
                email: '',
                imageId: null,
            });
            expect(ImagesApi.post).not.toHaveBeenCalled();
            expect(ImagesApi.put).not.toHaveBeenCalled();
            expect(ImagesApi.delete).toHaveBeenCalledTimes(1);
        });

        it('should update member as published and add a new image', async () => {
            (ImagesApi.post as jest.Mock).mockResolvedValue(mockImageResponse);
            const memberWithNewImage = { ...memberValues, image: mockImageValues, imageId: null };

            await TeamMembersApi.updatePublish(mockClient, memberId, memberWithNewImage);

            expect(ImagesApi.post).toHaveBeenCalledWith(mockClient, mockImageValues);
            expect(mockClient.put).toHaveBeenCalledWith(`/TeamMembers/${memberId}`, {
                fullName: memberWithNewImage.fullName,
                categoryId: memberWithNewImage.category.id,
                status: VisibilityStatus.Published,
                description: memberWithNewImage.description,
                email: '',
                imageId: mockImageResponse.id,
            });
        });

        it('should update member as published and update an existing image', async () => {
            (ImagesApi.put as jest.Mock).mockResolvedValue(mockImageResponse);
            const memberWithUpdatedImage = { ...memberValues, image: mockImageValues, imageId: 10 };

            await TeamMembersApi.updatePublish(mockClient, memberId, memberWithUpdatedImage);

            expect(ImagesApi.put).toHaveBeenCalledWith(mockClient, mockImageValues, 10);
            expect(mockClient.put).toHaveBeenCalledWith(`/TeamMembers/${memberId}`, {
                fullName: memberWithUpdatedImage.fullName,
                categoryId: memberWithUpdatedImage.category.id,
                status: VisibilityStatus.Published,
                description: memberWithUpdatedImage.description,
                email: '',
                imageId: mockImageResponse.id,
            });
        });

        it('should update member as published and remove the existing image', async () => {
            const memberWithRemovedImage: MemberFormValues = { ...memberValues, image: null, imageId: 10 };

            await TeamMembersApi.updatePublish(mockClient, memberId, memberWithRemovedImage);

            expect(mockClient.put).toHaveBeenCalledWith(`/TeamMembers/${memberId}`, {
                fullName: memberWithRemovedImage.fullName,
                categoryId: memberWithRemovedImage.category.id,
                status: VisibilityStatus.Published,
                description: memberWithRemovedImage.description,
                email: '',
                imageId: null,
            });
            expect(ImagesApi.delete).toHaveBeenCalledWith(mockClient, 10);
        });
    });

    describe('delete', () => {
        it('should delete a member by id', async () => {
            await TeamMembersApi.delete(mockClient, 42);
            expect(mockClient.delete).toHaveBeenCalledWith('/TeamMembers/42');
        });

        it('should throw an error if delete fails', async () => {
            const apiError = { response: { status: 404, data: 'Not Found' } };
            mockClient.delete.mockRejectedValue(apiError);
            await expect(TeamMembersApi.delete(mockClient, 99)).rejects.toMatchObject(apiError);
        });
    });

    describe('reorder', () => {
        it('should reorder team members for a given category', async () => {
            const payload = { categoryId: 1, orderedIds: [3, 2, 1] };
            await TeamMembersApi.reorder(mockClient, payload.categoryId, payload.orderedIds);

            expect(mockClient.put).toHaveBeenCalledWith('/TeamMembers/reorder', payload);
        });
    });

    describe('mapTeamMemberDtoToTeamMember', () => {
        const baseDto: TeamMemberDto = {
            id: 1,
            fullName: 'Name',
            category: { id: 1, name: 'Основна команда', description: 'Test' },
            priority: 1,
            description: 'Desc',
            image: mockImageResponse,
            email: '',
            status: VisibilityStatus.Draft,
        };

        it('should map DTO with Draft status correctly', () => {
            const dto = { ...baseDto, status: VisibilityStatus.Draft };
            const result = mapTeamMemberDtoToTeamMember(dto);
            expect(result.status).toBe('Чернетка');
        });

        it('should map DTO with Published status correctly', () => {
            const dto = { ...baseDto, status: VisibilityStatus.Published };
            const result = mapTeamMemberDtoToTeamMember(dto);
            expect(result.status).toBe('Опубліковано');
        });
    });
});
