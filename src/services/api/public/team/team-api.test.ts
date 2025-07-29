import { axiosInstance } from '../../axios';
import default_team_member_photo from '../../../../assets/images/public/team-page/team_member_not_found_photo.svg';
import { PublicCategoryWithTeamMembersDto, TeamPageData } from '../../../../types/public/team-page';
import { teamPageDataFetch } from './team-api';

jest.mock('../../../api/axios', () => ({
    axiosInstance: {
        get: jest.fn(),
    },
}));

describe('fetchTeamPageData', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return full valid data', async () => {
        const mockData = [
            {
                categoryName: 'Engineering',
                description: 'Dev team',
                teamMembers: [
                    { id: 1, fullName: 'Alice', description: 'Frontend Dev' },
                    { id: 2, fullName: 'Bob', description: null },
                ],
            },
            {
                categoryName: 'With no description',
                teamMembers: [{ id: 3, fullName: 'John', description: 'Backend Dev' }],
            },
        ];

        const expectedResult: TeamPageData = {
            teamData: [
                {
                    title: 'Engineering',
                    description: 'Dev team',
                    members: [
                        { id: 1, name: 'Alice', role: 'Frontend Dev', photo: default_team_member_photo },
                        { id: 2, name: 'Bob', role: '', photo: default_team_member_photo },
                    ],
                },
                {
                    title: 'With no description',
                    description: '',
                    members: [{ id: 3, name: 'John', role: 'Backend Dev', photo: default_team_member_photo }],
                },
            ],
        };

        const mockResponse = { data: mockData };

        (axiosInstance.get as jest.Mock).mockResolvedValueOnce(mockResponse);

        const result = await teamPageDataFetch();

        expect(result).toEqual(expectedResult);
    });

    it('should filter out invalid members', async () => {
        const mockData = [
            {
                categoryName: 'Design',
                description: 'Design team',
                teamMembers: [
                    // Invalid
                    { id: 3, fullName: '', description: 'UX' },
                    { id: 4, fullName: null, description: 'UI' },
                    { id: 7, description: 'UI' },
                    // Valid
                    { id: 5, fullName: 'John', description: 'Lead' },
                ],
            },
        ];

        const expectedResult: TeamPageData = {
            teamData: [
                {
                    title: 'Design',
                    description: 'Design team',
                    members: [{ id: 5, name: 'John', role: 'Lead', photo: default_team_member_photo }],
                },
            ],
        };

        const mockResponse = { data: mockData };

        (axiosInstance.get as jest.Mock).mockResolvedValueOnce(mockResponse);

        const result = await teamPageDataFetch();

        expect(result).toEqual(expectedResult);
    });

    it('should skip categories with invalid names or empty members', async () => {
        const mockData = [
            {
                // Without name
                categoryName: '',
                description: 'Marketing team',
                teamMembers: [{ id: 6, fullName: 'Anna', description: 'SEO' }],
            },
            {
                // Without team members
                categoryName: 'QA',
                description: 'Testers',
                teamMembers: [],
            },
            {
                // Without valid team members
                categoryName: 'PM',
                description: 'Product',
                teamMembers: [
                    // Without fullName
                    { id: 7, fullName: '', description: 'Product Owner' },
                ],
            },
            {
                // Without name
                description: 'Manager',
                teamMembers: [{ id: 8, fullName: 'John', description: 'Cool manager' }],
            },
        ];

        const expectedResult: TeamPageData = { teamData: [] };

        const mockResponse = { data: mockData };

        (axiosInstance.get as jest.Mock).mockResolvedValueOnce(mockResponse);

        const result = await teamPageDataFetch();

        expect(result).toEqual(expectedResult);
    });

    it('should handle completely empty response', async () => {
        const mockData: PublicCategoryWithTeamMembersDto[] = [];

        const expectedResult: TeamPageData = { teamData: [] };

        const mockResponse = { data: mockData };

        (axiosInstance.get as jest.Mock).mockResolvedValueOnce(mockResponse);

        const result = await teamPageDataFetch();

        expect(result).toEqual(expectedResult);
    });
});
