import { render } from '@testing-library/react';
import { WaveSwiper } from './WaveSwiper';
import { Swiper } from '../Swiper';

jest.mock('@/components/public/swiper/Swiper');
const MockSwiper = Swiper as jest.Mock;

describe('WaveSwiper', () => {
    it('should render Swiper with correct props', () => {
        const items = [{ id: 1 }, { id: 2 }];
        const renderItem = jest.fn();
        render(<WaveSwiper items={items} renderItemCallback={renderItem} />);
        expect(MockSwiper).toHaveBeenCalledWith(
            expect.objectContaining({
                items,
                renderItem,
                classNameSwiperSlide: 'swiper-slide',
                navigationButtons: {
                    prev: { className: 'left' },
                    next: { className: 'right' },
                },
            }),
            undefined,
        );
    });
});
