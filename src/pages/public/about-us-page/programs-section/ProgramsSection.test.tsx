import { render, screen } from '@testing-library/react';
import { ProgramsSection } from './ProgramsSection';
import { ProgramsPageData } from '@/types/public/programs-page';

jest.mock('./ProgramsSection.module.scss', () => ({
    root: 'root',
    swipers: 'swipers',
    scrollbar: 'scrollbar',
    line: 'line',
    drag: 'drag',
    left: 'left',
    right: 'right',
    swiperSlide: 'swiperSlide',
}));

jest.mock('@/components/public/program-card/ProgramCard', () => ({
    ProgramCard: ({ program }: { program: any }) => (
        <div data-testid="program-card">{program.name || program.title}</div>
    ),
}));

jest.mock('@/components/public/swiper/Swiper', () => ({
    Swiper: ({ items, renderItem }: any) => {
        if (!items || items.length === 0) return null;
        return (
            <div data-testid="swiper">
                {items.map((item: any, index: number) => (
                    <div key={index} data-testid="swiper-slide">
                        {renderItem(item, index)}
                    </div>
                ))}
            </div>
        );
    },
}));

jest.mock('@/assets/icons/arrow-right.svg', () => ({
    ReactComponent: () => <svg data-testid="arrow-right" />,
}));

jest.mock('@/assets/icons/arrow-left.svg', () => ({
    ReactComponent: () => <svg data-testid="arrow-left" />,
}));

describe('ProgramsSection', () => {
    const createMockProgram = (id: number, name: string) => ({
        id,
        name,
        slug: `program-${id}`,
        previewImage: { id: id, url: `image-${id}.jpg`, mimeType: 'image/jpeg' },
        description: `Description ${id}`,
        categories: [],
        localizations: [],
    });

    it('renders nothing when content is null', () => {
        render(<ProgramsSection content={null} />);
        expect(screen.queryByTestId('swiper')).not.toBeInTheDocument();
        expect(screen.queryAllByTestId('program-card')).toHaveLength(0);
    });

    it('renders nothing when programsData is empty', () => {
        const mockData: ProgramsPageData = {
            programsData: [],
            programsCategories: [],
        };
        render(<ProgramsSection content={mockData} />);
        expect(screen.queryByTestId('swiper')).not.toBeInTheDocument();
        expect(screen.queryAllByTestId('program-card')).toHaveLength(0);
    });

    it('renders Swiper with program cards when data is provided', () => {
        const mockData: ProgramsPageData = {
            programsData: [
                createMockProgram(1, 'Program 1'),
                createMockProgram(2, 'Program 2'),
                createMockProgram(3, 'Program 3'),
            ],
            programsCategories: [],
        };

        render(<ProgramsSection content={mockData} />);

        const swiper = screen.getByTestId('swiper');
        expect(swiper).toBeInTheDocument();

        const cards = screen.getAllByTestId('program-card');
        expect(cards).toHaveLength(mockData.programsData.length);

        mockData.programsData.forEach((program) => {
            expect(screen.getByText(program.name)).toBeInTheDocument();
        });
    });

    it('renders scrollbar container', () => {
        const mockData: ProgramsPageData = {
            programsData: [createMockProgram(1, 'Program 1')],
            programsCategories: [],
        };

        const { container } = render(<ProgramsSection content={mockData} />);
        const scrollbar = container.querySelector('.scrollbar');
        expect(scrollbar).toBeInTheDocument();
    });
});
