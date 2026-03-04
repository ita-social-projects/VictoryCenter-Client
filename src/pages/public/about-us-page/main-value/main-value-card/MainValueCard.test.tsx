import { render, screen } from '@testing-library/react';
import { MainValueCard } from './MainValueCard';
import { ContentType } from '@/types/common/about-us';
import { AboutUsContent } from '@/types/public/about-us-page';
import { TranslationStatus } from '@/types/common/language';
import { useGetLocalization } from '@/hooks/common/use-get-localization/useGetLocalization';
import { setupUseGetLocalizationTitleDescriptionMock } from '@/utils/test-mocks/use-get-localization-mock';

jest.mock('@/hooks/common/use-get-localization/useGetLocalization', () => ({
    useGetLocalization: jest.fn(),
}));

const mockedUseGetLocalization = useGetLocalization as jest.Mock;

describe('MainValueCard component', () => {
    beforeEach(() => {
        setupUseGetLocalizationTitleDescriptionMock(mockedUseGetLocalization);
    });

    const person: AboutUsContent = {
        id: 1,
        contentType: ContentType.Card,
        image: null,
        description: 'Fallback description',
        title: null,
        localizations: [],
    };

    it('should render image with correct src and alt', () => {
        render(<MainValueCard person={person} index={0} imageUrl="test.jpg" altText="Test alt" />);

        const img = screen.getByRole('img');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', 'test.jpg');
        expect(img).toHaveAttribute('alt', 'Test alt');
    });

    it('should render fallback description when no localizations', () => {
        render(<MainValueCard person={person} index={0} imageUrl="test.jpg" altText="Test alt" />);

        expect(screen.getByText('Fallback description')).toBeInTheDocument();
    });

    it('should render localized description when localizations are provided', () => {
        const personWithLocalization: AboutUsContent = {
            ...person,
            localizations: [
                {
                    language: { id: 1, code: 'uk' },
                    translationStatus: TranslationStatus.Relevant,
                    description: 'Localized description',
                    title: null,
                },
            ],
        };

        render(
            <MainValueCard person={personWithLocalization} index={0} imageUrl="test.jpg" altText="Test alt" />,
        );

        expect(screen.getByText('Localized description')).toBeInTheDocument();
    });

    it('should not render fallback text when localized description is provided', () => {
        const personWithLocalization: AboutUsContent = {
            ...person,
            localizations: [
                {
                    language: { id: 1, code: 'uk' },
                    translationStatus: TranslationStatus.Relevant,
                    description: 'Localized description',
                    title: null,
                },
            ],
        };

        render(
            <MainValueCard person={personWithLocalization} index={0} imageUrl="test.jpg" altText="Test alt" />,
        );

        expect(screen.queryByText('Fallback description')).not.toBeInTheDocument();
    });

    it('should pass imageUrl to the img element', () => {
        render(<MainValueCard person={person} index={1} imageUrl="custom-image.jpg" altText="Custom alt" />);

        const img = screen.getByRole('img');
        expect(img).toHaveAttribute('src', 'custom-image.jpg');
        expect(img).toHaveAttribute('alt', 'Custom alt');
    });

    it('should render all four card indexes without error', () => {
        for (let i = 0; i < 4; i++) {
            const { unmount } = render(
                <MainValueCard person={person} index={i} imageUrl="img.jpg" altText={`Card ${i}`} />,
            );
            expect(screen.getByAltText(`Card ${i}`)).toBeInTheDocument();
            unmount();
        }
    });
});
