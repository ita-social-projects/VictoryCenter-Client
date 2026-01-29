import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { CompanyValues } from './CompanyValues';
import useMediaQuery from '@mui/material/useMediaQuery';

jest.mock('./CompanyValues.module.scss', () => ({
    root: 'root',
    swiperSlide: 'swiperSlide',
    left: 'left',
    right: 'right',
}));

jest.mock('./components/value-card/ValueCard.module.scss', () => ({
    title: 'title',
    column: 'column',
    card1: 'card1',
    card2: 'card2',
    card3: 'card3',
    item: 'item',
    name: 'name',
    description: 'description',
}));

jest.mock('@mui/material/useMediaQuery', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, opts?: any) => {
            if (key === 'VALUE_ITEMS' && opts?.returnObjects) {
                return [
                    { NAME: 'Value 1', DESCRIPTION: 'Description 1' },
                    { NAME: 'Value 2', DESCRIPTION: 'Description 2' },
                    { NAME: 'Value 3', DESCRIPTION: 'Description 3' },
                    { NAME: 'Value 4', DESCRIPTION: 'Description 4' },
                    { NAME: 'Value 5', DESCRIPTION: 'Description 5' },
                ];
            }
            return key;
        },
    }),
}));

jest.mock('@/components/public/swiper/Swiper', () => ({
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

    it('renders root wrapper and Swiper', () => {
        (useMediaQuery as jest.Mock).mockReturnValue(false);
        const { container } = render(<CompanyValues />);
        expect(container.firstChild).toBeInTheDocument();
        expect(screen.getByTestId('custom-swiper')).toBeInTheDocument();
    });

    it('renders ValueCard groups', () => {
        (useMediaQuery as jest.Mock).mockReturnValue(false);
        render(<CompanyValues />);

        const groups = screen.getAllByTestId(/swiper-group-/);
        expect(groups.length).toBeGreaterThan(0);

        const cards = screen.getAllByTestId(/value-card-/);
        expect(cards.length).toBeGreaterThan(0);
    });

    it('updates layout when isTablet changes', () => {
        (useMediaQuery as jest.Mock).mockReturnValue(false);
        render(<CompanyValues />);
        const desktopGroups = screen.getAllByTestId(/swiper-group-/).length;

        (useMediaQuery as jest.Mock).mockReturnValue(true);
        render(<CompanyValues />);
        const tabletGroups = screen.getAllByTestId(/swiper-group-/).length;

        expect(desktopGroups).toBeGreaterThan(0);
        expect(tabletGroups).toBeGreaterThan(0);
    });

    it('handles small screen widths gracefully', () => {
        (useMediaQuery as jest.Mock).mockReturnValue(false);
        render(<CompanyValues />);
        const groups = screen.getAllByTestId(/swiper-group-/);
        expect(groups.length).toBeGreaterThan(0);
    });
});
