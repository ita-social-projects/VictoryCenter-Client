import { render, screen } from '@testing-library/react';
import { SupportCard } from './SupportCard';
import { ContentType } from '@/types/common/about-us';
import { AboutUsContent } from '@/types/public/about-us-page';
import { aboutUsPageUk } from '@/locales/uk';
import { useGetLocalization } from '@/hooks/common/use-get-localization/useGetLocalization';
import { TranslationStatus } from '@/types/common/language';
import { setupUseGetLocalizationTitleDescriptionMock } from '@/utils/test-mocks/use-get-localization-mock';

jest.mock('./SupportCard.module.scss', () => ({
    'people-card': 'people-card',
    'card-1': 'card-1',
    'card-2': 'card-2',
    'card-3': 'card-3',
    image: 'image',
    description: 'description',
}));

jest.mock('@/const/public/about-us-page', () => ({
    ABOUT_US_DATA: {
        SUPPORT_DATA: [{ IMG: 'default-image-1.jpg' }, { IMG: 'default-image-2.jpg' }, { IMG: 'default-image-3.jpg' }],
    },
}));

jest.mock('@/hooks/common/use-get-localization/useGetLocalization', () => ({
    useGetLocalization: jest.fn(),
}));

const mockedUseGetLocalization = useGetLocalization as jest.Mock;

describe('SupportCard component', () => {
    beforeEach(() => {
        setupUseGetLocalizationTitleDescriptionMock(mockedUseGetLocalization);
    });

    const card: AboutUsContent = {
        id: 1,
        contentType: ContentType.Card,
        image: {
            id: 1,
            url: 'https://example.com/image.jpg',
            mimeType: 'image/jpeg',
        },
        description: 'This is a support card description.',
        title: null,
        localizations: [],
    };

    const defaultProps = {
        card: card,
        index: 0,
    };

    it('renders image with correct src and alt', () => {
        render(<SupportCard {...defaultProps} />);
        const image = screen.getByRole('img');
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', card.image!.url);
        expect(image).toHaveAttribute('alt', aboutUsPageUk.SUPPORT_DATA[0].ALT);
    });

    it('renders description text', () => {
        render(<SupportCard {...defaultProps} />);
        expect(screen.getByText(card.description!)).toBeInTheDocument();
    });

    it('renders correct classes for multiple indexes', () => {
        const { rerender } = render(<SupportCard card={card} index={0} />);
        const card1 = screen.getByRole('img').closest('div');
        expect(card1).toHaveClass('people-card');
        expect(card1).toHaveClass('card-1');

        rerender(<SupportCard card={card} index={2} />);
        const card3 = screen.getByRole('img').closest('div');
        expect(card3).toHaveClass('people-card');
        expect(card3).toHaveClass('card-3');
    });

    it('renders localized description when localizations are provided', () => {
        const cardWithLocalization: AboutUsContent = {
            ...card,
            localizations: [
                {
                    language: { id: 1, code: 'uk' },
                    translationStatus: TranslationStatus.Relevant,
                    description: 'Localized card description.',
                    title: null,
                },
            ],
        };

        render(<SupportCard card={cardWithLocalization} index={0} />);

        expect(screen.getByText('Localized card description.')).toBeInTheDocument();
    });
});
