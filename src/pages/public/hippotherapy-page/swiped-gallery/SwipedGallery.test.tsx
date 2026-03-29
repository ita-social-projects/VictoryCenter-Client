import { render, screen } from '@testing-library/react';
import { SwipedGallery } from './SwipedGallery';
import { SwipedCard } from '@/components/public/swiper/swiped-card/SwipedCard';
import { HIPPOTHERAPY_SWIPED_IMAGES } from '@/const/public/hippotherapy-page';

jest.mock('@/components/public/swiper/swiped-card/SwipedCard');
const MockSwipedCard = SwipedCard as jest.Mock;

jest.mock('@/hooks/common/use-get-localization/useGetLocalization');

describe('SwipedGallery component', () => {
    const cards = [
        {
            imgURL: 'img1.jpeg',
            imgAlternativeText: 'First image',
            text: 'Description 1',
        },
        {
            imgURL: null as unknown as string,
            imgAlternativeText: 'Second image',
            text: 'Description 2',
        },
    ];

    it('should render title', () => {
        render(<SwipedGallery title={'Title'} cards={cards} />);
        expect(screen.getByText('Title')).toBeInTheDocument();
    });

    it('should call SwipedCard component with properties', () => {
        const firstCardIndx = 0;
        const secondCardIndx = 1;
        render(<SwipedGallery title={'Title'} cards={cards} />);
        expect(MockSwipedCard).toHaveBeenCalledTimes(2);
        expect(MockSwipedCard).toHaveBeenCalledWith(
            expect.objectContaining({
                description: cards[firstCardIndx].text,
                index: firstCardIndx,
                imageUrl: cards[firstCardIndx].imgURL,
                altText: cards[firstCardIndx].imgAlternativeText,
            }),
            undefined,
        );
        expect(MockSwipedCard).toHaveBeenLastCalledWith(
            expect.objectContaining({
                description: cards[secondCardIndx].text,
                index: secondCardIndx,
                imageUrl: HIPPOTHERAPY_SWIPED_IMAGES[secondCardIndx],
                altText: cards[secondCardIndx].imgAlternativeText,
            }),
            undefined,
        );
    });
});
