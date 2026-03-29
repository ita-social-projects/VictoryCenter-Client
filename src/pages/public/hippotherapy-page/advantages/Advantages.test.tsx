import { render, screen } from '@testing-library/react';
import { Advantages } from './Advantages';
import { MainValueCard } from '../../about-us-page/main-value/main-value-card/MainValueCard';
import { HippotherapyAdvantage } from '@/types/public/hippotherapy-page';
import { HIPPOTHERAPY_ADVANTAGES } from '@/const/public/hippotherapy-page';

jest.mock('@/pages/public/about-us-page/main-value/main-value-card/MainValueCard');
const MockMainValueCard = MainValueCard as jest.Mock;

jest.mock('@/hooks/common/use-get-localization/useGetLocalization');

describe('Advantages component', () => {
    const advantages: HippotherapyAdvantage[] = [
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
        render(<Advantages title={'Title'} advantages={advantages} />);
        expect(screen.getByText('Title')).toBeInTheDocument();
    });

    it('should call MainValueCard component with properties', () => {
        const firstCardIndx = 0;
        const secondCardIndx = 1;
        render(<Advantages title={'Title'} advantages={advantages} />);
        expect(MockMainValueCard).toHaveBeenCalledTimes(2);
        expect(MockMainValueCard).toHaveBeenCalledWith(
            expect.objectContaining({
                description: advantages[firstCardIndx].text,
                index: firstCardIndx,
                imageUrl: advantages[firstCardIndx].imgURL,
                altText: advantages[firstCardIndx].imgAlternativeText,
            }),
            undefined,
        );
        expect(MockMainValueCard).toHaveBeenLastCalledWith(
            expect.objectContaining({
                description: advantages[secondCardIndx].text,
                index: secondCardIndx,
                imageUrl: HIPPOTHERAPY_ADVANTAGES.IMAGES[secondCardIndx],
                altText: advantages[secondCardIndx].imgAlternativeText,
            }),
            undefined,
        );
    });
});
