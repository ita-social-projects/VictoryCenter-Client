import { render, screen } from '@testing-library/react';
import { SwipedCard } from './SwipedCard';
import { ContentType } from '@/types/common/about-us';
import { TranslationStatus, EntityLocalization } from '@/types/common/language';
import { useGetLocalization } from '@/hooks/common/use-get-localization/useGetLocalization';
import { setupUseGetLocalizationAboutUsContentMock } from '@/utils/test-mocks/use-get-localization-mock';

jest.mock('@/hooks/common/use-get-localization/useGetLocalization');

const mockedUseGetLocalization = jest.mocked(useGetLocalization);

type CardLocalization = EntityLocalization & {
    description: string | null;
    title: string | null;
};

describe('SwipedCard component', () => {
    beforeEach(() => {
        setupUseGetLocalizationAboutUsContentMock(mockedUseGetLocalization);
    });

    const card = {
        id: 1,
        contentType: ContentType.Card,
        image: null,
        description: 'Fallback description',
        title: null,
        localizations: [],
    };
    const defaultProps = {
        description: card.description,
        localizations: card.localizations,
        index: 0,
        imageUrl: 'test.jpg',
        altText: 'Test alt',
    };

    it('should render image with correct src and alt', () => {
        render(<SwipedCard {...defaultProps} />);

        const img = screen.getByRole('img');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', 'test.jpg');
        expect(img).toHaveAttribute('alt', 'Test alt');
    });

    it('should render fallback description when no localizations', () => {
        render(<SwipedCard {...defaultProps} />);

        expect(screen.getByText('Fallback description')).toBeInTheDocument();
    });

    it('should render localized description when localizations provided', () => {
        const localizations: CardLocalization[] = [
            {
                language: { id: 1, code: 'uk' },
                translationStatus: TranslationStatus.Relevant,
                description: 'Localized description',
                title: null,
            },
        ];

        render(<SwipedCard {...defaultProps} localizations={localizations} />);

        expect(screen.getByText('Localized description')).toBeInTheDocument();
    });

    it('should not render fallback text when localized description provided', () => {
        const localizations: CardLocalization[] = [
            {
                language: { id: 1, code: 'uk' },
                translationStatus: TranslationStatus.Relevant,
                description: 'Localized description',
                title: null,
            },
        ];

        render(<SwipedCard {...defaultProps} localizations={localizations} />);

        expect(screen.queryByText('Fallback description')).not.toBeInTheDocument();
    });

    it('should not render any text when the description is empty', () => {
        render(<SwipedCard {...defaultProps} description={null} localizations={[]} />);
        expect(screen.queryByText('Fallback description')).not.toBeInTheDocument();
        expect(screen.queryByText('Localized description')).not.toBeInTheDocument();
    });

    it('should pass imageUrl to the img element', () => {
        render(<SwipedCard {...defaultProps} index={1} imageUrl="custom-image.jpg" altText="Custom alt" />);

        const img = screen.getByRole('img');
        expect(img).toHaveAttribute('src', 'custom-image.jpg');
        expect(img).toHaveAttribute('alt', 'Custom alt');
    });

    it('should render all four card indexes without error', () => {
        for (let i = 0; i < 4; i++) {
            const { unmount } = render(
                <SwipedCard {...defaultProps} index={i} imageUrl="img.jpg" altText={`Card ${i}`} />,
            );
            expect(screen.getByAltText(`Card ${i}`)).toBeInTheDocument();
            unmount();
        }
    });
});
