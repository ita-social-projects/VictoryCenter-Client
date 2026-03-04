import { render, screen } from '@testing-library/react';
import { AboutUsIntro } from './IntroSection';
import { ContentType } from '@/types/common/about-us';
import { AboutUsContent } from '@/types/public/about-us-page';
import { useGetLocalization } from '@/hooks/common/use-get-localization/useGetLocalization';
import { TranslationStatus } from '@/types/common/language';
import { setupUseGetLocalizationTitleDescriptionMock } from '@/utils/test-mocks/use-get-localization-mock';

jest.mock('@/hooks/common/use-get-localization/useGetLocalization', () => ({
    useGetLocalization: jest.fn(),
}));

const mockedUseGetLocalization = useGetLocalization as jest.Mock;

describe('AboutUsIntro', () => {
    beforeEach(() => {
        setupUseGetLocalizationTitleDescriptionMock(mockedUseGetLocalization);
    });

    const Content: AboutUsContent[] = [
        {
            contentType: ContentType.Title,
            title: 'Test title',
            id: 1,
            image: null,
            description: null,
            localizations: [],
        },
        {
            contentType: ContentType.Description,
            description: 'Test description',
            id: 2,
            image: null,
            title: null,
            localizations: [],
        },
        {
            contentType: ContentType.Image,
            image: {
                id: null,
                url: 'test.jpg',
                mimeType: 'image.jpeg',
            },
            description: null,
            id: 3,
            title: null,
            localizations: [],
        },
    ];

    it('should render default images correctly', () => {
        render(<AboutUsIntro content={null} />);
        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(2);
        expect(images[0]).toHaveClass('image');
        expect(images[1]).toHaveClass('overlay');
    });

    it('should render custom images correctly', () => {
        render(<AboutUsIntro content={Content} />);
        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(2);
        expect(images[0]).toHaveAttribute('src', 'test.jpg');
        expect(images[1]).toHaveAttribute('src', 'test.jpg');
        expect(images[0]).toHaveClass('image');
        expect(images[1]).toHaveClass('overlay');
    });

    it('should render title and description correctly', () => {
        render(<AboutUsIntro content={Content} />);
        const title = screen.getByRole('heading', { level: 1 });
        expect(title).toBeInTheDocument();
        expect(title).toHaveTextContent('Test title');

        const description = screen.getByText('Test description');
        expect(description).toBeInTheDocument();
    });

    it('should render localized title and description when localizations are provided', () => {
        const contentWithLocalization = [
            {
                ...Content[0],
                localizations: [
                    {
                        language: { id: 1, code: 'uk' },
                        translationStatus: TranslationStatus.Relevant,
                        title: 'Localized title',
                        description: null,
                    },
                ],
            },
            {
                ...Content[1],
                localizations: [
                    {
                        language: { id: 1, code: 'uk' },
                        translationStatus: TranslationStatus.Relevant,
                        description: 'Localized description',
                        title: null,
                    },
                ],
            },
            Content[2],
        ];

        render(<AboutUsIntro content={contentWithLocalization} />);

        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Localized title');
        expect(screen.getByText('Localized description')).toBeInTheDocument();
    });
});
