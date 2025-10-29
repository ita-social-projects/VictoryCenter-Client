import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { CompanyValues } from './CompanyValues';
import useMediaQuery from '@mui/material/useMediaQuery';

jest.mock('@mui/material/useMediaQuery', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('../../../../components/public/swiper/Swiper', () => ({
    Swiper: ({ items, renderItem }: any) => (
        <div data-testid="custom-swiper">
            {items.map((group: any, index: number) => (
                <div key={index} data-testid={`swiper-group-${index}`}>
                    {renderItem(group, index)}
                </div>
            ))}
        </div>
    ),
}));

jest.mock('./components/value-card/ValueCard', () => ({
    ValueCard: ({ groupIndex }: any) => <div data-testid={`value-card-${groupIndex}`}>Card {groupIndex}</div>,
}));

describe('CompanyValues', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders wrapper and Swiper', () => {
        (useMediaQuery as jest.Mock).mockReturnValue(false);
        render(<CompanyValues />);
        expect(screen.getByTestId('custom-swiper')).toBeInTheDocument();
        expect(document.querySelector('.values-block')).toBeInTheDocument();
    });

    it('renders ValueCard groups', () => {
        (useMediaQuery as jest.Mock).mockReturnValue(false);
        render(<CompanyValues />);
        expect(screen.getAllByTestId(/swiper-group-/).length).toBeGreaterThan(0);
    });

    it('updates layout when isTablet changes', () => {
        (useMediaQuery as jest.Mock).mockReturnValue(false);
        const { rerender } = render(<CompanyValues />);
        const desktopGroups = screen.getAllByTestId(/swiper-group-/).length;

        (useMediaQuery as jest.Mock).mockReturnValue(true);
        rerender(<CompanyValues />);
        const tabletGroups = screen.getAllByTestId(/swiper-group-/).length;

        expect(desktopGroups).not.toBe(tabletGroups);
    });

    it('handles small screen widths gracefully', () => {
        (useMediaQuery as jest.Mock).mockReturnValue(false);
        render(<CompanyValues />);
        const groups = screen.getAllByTestId(/swiper-group-/);
        expect(groups.length).toBeGreaterThan(0);
    });
});
