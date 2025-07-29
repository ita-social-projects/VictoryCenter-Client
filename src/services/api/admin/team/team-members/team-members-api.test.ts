import { AxiosInstance } from 'axios';
import { MemberFormValues } from '../../../../../pages/admin/team/components/member-form/MemberForm';
import { TeamMemberDto } from '../../../../../types/admin/team-members';
import { TeamMembersApi, mapTeamMemberDtoToTeamMember } from './team-members-api';

const mockClient = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
} as unknown as jest.Mocked<AxiosInstance>;

describe('TeamMembersApi', () => {
    it('should fetch and map team members', async () => {
        const mockDto = [
            {
                id: 1,
                fullName: 'Test Member',
                category: {
                    id: 1,
                    name: 'Основна команда',
                    description: 'Test',
                },
                priority: 1,
                status: 1,
                description: 'Test description',
                photo: 'photo.png',
                email: 'test@example.com',
            },
        ];

        mockClient.get.mockResolvedValue({ data: mockDto });

        const members = await TeamMembersApi.getAll(mockClient);

        expect(mockClient.get).toHaveBeenCalledWith('/TeamMembers', { params: {} });
        expect(members).toEqual([
            {
                id: 1,
                img: 'photo.png',
                fullName: 'Test Member',
                description: 'Test description',
                status: 'Опубліковано',
                category: {
                    id: 1,
                    name: 'Основна команда',
                    description: 'Test',
                },
            },
        ]);
    });

    it('should send PUT request with draft status', async () => {
        const member: MemberFormValues = {
            fullName: 'Member',
            category: {
                id: 1,
                name: 'Основна команда',
                description: 'Test',
            },
            description: 'desc',
            img: null,
        };

        const putMock = jest.spyOn(mockClient, 'put').mockResolvedValue({});

        await TeamMembersApi.updateDraft(mockClient, 5, member);

        expect(putMock).toHaveBeenCalledWith('/TeamMembers/5', {
            fullName: 'Member',
            categoryId: 1,
            status: 0,
            description: 'desc',
            email: '',
        });
    });

    it('should send PUT request with published status', async () => {
        const member: MemberFormValues = {
            fullName: 'Member',
            category: {
                id: 1,
                name: 'Основна команда',
                description: 'Test',
            },
            description: 'desc',
            img: null,
        };

        const putMock = jest.spyOn(mockClient, 'put').mockResolvedValue({});

        await TeamMembersApi.updatePublish(mockClient, 5, member);

        expect(putMock).toHaveBeenCalledWith('/TeamMembers/5', {
            fullName: 'Member',
            categoryId: 1,
            status: 1,
            description: 'desc',
            email: '',
        });
    });

    it('should post member as draft', async () => {
        const member: MemberFormValues = {
            fullName: 'Draft Member',
            category: {
                id: 1,
                name: 'Основна команда',
                description: 'Test',
            },
            description: 'description',
            img: null,
        };

        const postMock = jest.spyOn(mockClient, 'post').mockResolvedValue({});

        await TeamMembersApi.postDraft(mockClient, member);

        expect(postMock).toHaveBeenCalledWith('/TeamMembers', {
            fullName: 'Draft Member',
            categoryId: 1,
            status: 0,
            description: 'description',
            email: '',
        });
    });

    it('should post member as published', async () => {
        const member: MemberFormValues = {
            fullName: 'Draft Member',
            category: {
                id: 1,
                name: 'Основна команда',
                description: 'Test',
            },
            description: 'description',
            img: null,
        };

        const postMock = jest.spyOn(mockClient, 'post').mockResolvedValue({});

        await TeamMembersApi.postPublished(mockClient, member);

        expect(postMock).toHaveBeenCalledWith('/TeamMembers', {
            fullName: 'Draft Member',
            categoryId: 1,
            status: 1,
            description: 'description',
            email: '',
        });
    });

    it('should delete member by id', async () => {
        const deleteMock = jest.spyOn(mockClient, 'delete').mockResolvedValue({});
        await TeamMembersApi.delete(mockClient, 42);
        expect(deleteMock).toHaveBeenCalledWith('/TeamMembers/42');
    });

    it('should reorder team members', async () => {
        const putMock = jest.spyOn(mockClient, 'put').mockResolvedValue({});
        await TeamMembersApi.reorder(mockClient, 1, [3, 2, 1]);

        expect(putMock).toHaveBeenCalledWith('/TeamMembers/reorder', {
            categoryId: 1,
            orderedIds: [3, 2, 1],
        });
    });

    it('should map DTO to internal member format', () => {
        const dto: TeamMemberDto = {
            id: 1,
            fullName: 'Name',
            category: {
                id: 1,
                name: 'Основна команда',
                description: 'Test',
            },
            priority: 1,
            status: 0,
            description: 'Desc',
            photo: 'photo.jpg',
            email: '',
        };

        const result = mapTeamMemberDtoToTeamMember(dto);

        expect(result).toEqual({
            id: 1,
            fullName: 'Name',
            img: 'photo.jpg',
            description: 'Desc',
            status: 'Чернетка',
            category: {
                id: 1,
                name: 'Основна команда',
                description: 'Test',
            },
        });
    });

    it('should throw a 404 error when member list not found', async () => {
        mockClient.get.mockRejectedValue({
            response: { status: 404, data: 'Not found' },
        });

        await expect(TeamMembersApi.getAll(mockClient)).rejects.toMatchObject({
            response: { status: 404 },
        });

        expect(mockClient.get).toHaveBeenCalledWith('/TeamMembers', { params: {} });
    });

    it('should throw a 500 error when the server fails', async () => {
        mockClient.get.mockRejectedValue({
            response: { status: 500, data: 'Server error' },
        });

        await expect(TeamMembersApi.getAll(mockClient)).rejects.toMatchObject({
            response: { status: 500 },
        });

        expect(mockClient.get).toHaveBeenCalledWith('/TeamMembers', { params: {} });
    });

    it('should return an empty array when the API sends an empty list', async () => {
        const emptyDto: [] = [];

        mockClient.get.mockResolvedValue({ data: emptyDto });

        const members = await TeamMembersApi.getAll(mockClient);

        expect(Array.isArray(members)).toBe(true);
        expect(members).toHaveLength(0);
    });
});
