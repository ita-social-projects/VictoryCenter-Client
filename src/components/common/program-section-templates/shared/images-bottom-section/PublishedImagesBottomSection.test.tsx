import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PublishedImagesBottomSection } from './PublishedImagesBottomSection';
import { getImageSrc } from '@/utils/functions/image-helper/image-helper';

const mockSwiper = jest.fn();

jest.mock('@/components/public/swiper/Swiper', () => ({
    Swiper: (props: any) => {
        mockSwiper(props);
        return (
            <div data-testid="swiper">
                {(props.items ?? []).map((it: any, idx: number) => (
                    <div key={idx} data-testid={`swiper-item-${idx}`}>
                        {props.renderItem(it, idx)}
                    </div>
                ))}
            </div>
        );
    },
}));

jest.mock('@/utils/functions/image-helper/image-helper', () => ({
    getImageSrc: jest.fn(),
}));

jest.mock('./PublishedImagesBottomSection.module.scss', () => ({
    'bottom-section': 'bottom-section',
    'image-wrapper': 'image-wrapper',
    image: 'image',
}));

jest.mock('./ImagesBottomSwiper.module.scss', () => ({
    swiperContainer: 'swiperContainer',
    swiperSlide: 'swiperSlide',
    left: 'left',
    right: 'right',
}));

describe('PublishedImagesBottomSection', () => {
    const config = {
        elevatedIndices: [1],
        swiperBreakpoints: { 320: { slidesPerView: 1 } },
    } as any;

    const renderComponent = (override: Partial<React.ComponentProps<typeof PublishedImagesBottomSection>> = {}) => {
        mockSwiper.mockClear();
        (getImageSrc as jest.Mock).mockClear();

        const props: React.ComponentProps<typeof PublishedImagesBottomSection> = {
            images: [],
            config,
            bottomSectionClassName: '',
            imageWrapperClassName: '',
            imageClassName: '',
            ...override,
        };

        return render(<PublishedImagesBottomSection {...props} />);
    };

    const getSwiperProps = () => mockSwiper.mock.calls[0]?.[0];

    beforeEach(() => {
        (getImageSrc as jest.Mock).mockImplementation(() => '');
    });

    it('renders Swiper with items and config props', () => {
        const images = [{ url: 'u1' } as any, { url: 'u2' } as any];

        renderComponent({ images });

        const props = getSwiperProps();
        expect(props.items).toBe(images);
        expect(props.slidesPerView).toBe('auto');
        expect(props.breakpoints).toBe(config.swiperBreakpoints);
        expect(props.classNameSwiperSlide).toBe('swiperSlide');
        expect(props.navigationButtons).toEqual({
            prev: { className: 'left' },
            next: { className: 'right' },
        });
        expect(typeof props.renderItem).toBe('function');
    });

    it('renders images when getImageSrc returns src and sets alt', () => {
        (getImageSrc as jest.Mock).mockReturnValueOnce('src-1').mockReturnValueOnce('src-2');

        renderComponent({ images: [{ url: 'x' } as any, { url: 'y' } as any] });

        const imgs = screen.getAllByAltText(/Program section/);
        expect(imgs).toHaveLength(2);
        expect(imgs[0]).toHaveAttribute('src', 'src-1');
        expect(imgs[0]).toHaveAttribute('alt', 'Program section 1');
        expect(imgs[1]).toHaveAttribute('src', 'src-2');
        expect(imgs[1]).toHaveAttribute('alt', 'Program section 2');
    });

    it('does not render img when getImageSrc returns empty string', () => {
        renderComponent({ images: [null] });

        expect(screen.queryByAltText('Program section 1')).not.toBeInTheDocument();
        expect(screen.getAllByTestId('image-wrapper')).toHaveLength(1);
    });

    it('sets data-elevated based on config.elevatedIndices', () => {
        (getImageSrc as jest.Mock).mockReturnValueOnce('src-0').mockReturnValueOnce('src-1');

        renderComponent({ images: [{ url: 'a' } as any, { url: 'b' } as any] });

        const imgs = screen.getAllByAltText(/Program section/);
        expect(imgs[0]).toHaveAttribute('data-elevated', 'false');
        expect(imgs[1]).toHaveAttribute('data-elevated', 'true');
    });

    it('applies className overrides', () => {
        (getImageSrc as jest.Mock).mockReturnValueOnce('src');

        const { container } = renderComponent({
            images: [{ url: 'a' } as any],
            bottomSectionClassName: 'bottom-extra',
            imageWrapperClassName: 'wrap-extra',
            imageClassName: 'img-extra',
        });

        expect(container.firstChild).toHaveClass('bottom-extra');
        expect(screen.getByTestId('image-wrapper')).toHaveClass('wrap-extra');

        const img = screen.getByAltText('Program section 1');
        expect(img).toHaveClass('img-extra');
    });
});
