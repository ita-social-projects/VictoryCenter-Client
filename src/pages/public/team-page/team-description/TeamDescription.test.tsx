import { useGetLocalization } from "@/hooks/common/use-get-localization/useGetLocalization";
import { TeamItem } from "@/types/public/team-page";
import { TeamDescription } from "./TeamDescription";
import { render, screen } from '@testing-library/react';
import { EntityLocalization } from "@/types/common/language";

jest.mock('@/hooks/common/use-get-localization/useGetLocalization', () => ({
    useGetLocalization: jest.fn(),
}));
const mockedUseGetLocalization = useGetLocalization as jest.Mock;

describe('test team description component', () => {
    beforeEach(() => {
        mockedUseGetLocalization.mockImplementation((_localizations, fallback) => {
            return fallback;
        });
    });
    afterEach(() => {
        jest.clearAllMocks();
    })

    const mockTeamItem: TeamItem = {
        title: 'Керівництво проєкту',
        description: 'Керівники компанією, що зібралися разом, аби змінити цей світ на краще та працювати на благо суспільства',
        localizations: [
            {
                language: {
                    id: 2,
                    code: 'en',
                },
                name: 'PROJECT MANAGERS',
                description: 'Company leaders who have come together to change this world for the better and work for the benefit of society',
                translationStatus: 0,
            },
        ],
        members: []
    };

    it('should display Ukrainian content (fallback)', () => {
        render(<TeamDescription team={mockTeamItem}/>);

        const name = screen.getByText(mockTeamItem.title);
        const description = screen.getByText(mockTeamItem.description);

        expect(name).toBeInTheDocument();
        expect(description).toBeInTheDocument();
    });

    it('should display English localized content', () => {
        mockedUseGetLocalization.mockImplementation((localizations, fallback) => {
            const enLocalization = localizations?.find((loc: EntityLocalization) => loc.language.code === 'en');
            
            if (enLocalization) {
                const { language: _language, translationStatus: _translationStatus, ...localizableFields } = enLocalization;
                return {
                    ...fallback,
                    ...localizableFields,
                };
            }
            return fallback;
        });

        render(<TeamDescription team={mockTeamItem}/>);

        const englishName = screen.getByText('PROJECT MANAGERS');
        const englishDescription = screen.getByText('Company leaders who have come together to change this world for the better and work for the benefit of society');

        expect(englishName).toBeInTheDocument();
        expect(englishDescription).toBeInTheDocument();

        expect(screen.queryByText(mockTeamItem.title)).not.toBeInTheDocument();
        expect(screen.queryByText(mockTeamItem.description)).not.toBeInTheDocument();
    });

    it('should have correct class', () => {
        const { container } = render(<TeamDescription team={mockTeamItem}/>);
        expect(container.querySelector('.team_description')).toBeInTheDocument();
    });
});