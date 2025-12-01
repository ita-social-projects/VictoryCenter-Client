import { render, screen } from '@testing-library/react';
import { SupportSection } from './SupportSection';
import { ContentType } from '../../../../types/common/about-us';
import { AboutUsContent } from '../../../../types/public/about-us-page';
import aboutUsPageUk from '../../../../locales/uk/about-us.json';
import useMediaQuery from '@mui/material/useMediaQuery';

jest.mock('@mui/material/useMediaQuery');

const mockedUseMediaQuery = useMediaQuery as jest.MockedFunction<typeof useMediaQuery>;

describe('SupportSection component', () => {
    const mockContent: AboutUsContent[] = [
        {
            contentType: ContentType.Card,
            title: null,
            id: 1,
            image: {
                id: 1,
                url: 'card1.jpg',
                mimeType: 'image/jpeg',
            },
            description: 'Description 1',
        },
        {
            contentType: ContentType.Card,
            description: 'Description 2',
            id: 2,
            image: {
                id: 2,
                url: 'card2.jpg',
                mimeType: 'image/jpeg',
            },
            title: null,
        },
        {
            contentType: ContentType.Card,
            image: {
                id: 3,
                url: 'card3.jpg',
                mimeType: 'image/jpeg',
            },
            description: 'Description 3',
            id: 3,
            title: null,
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        mockedUseMediaQuery.mockReturnValue(false);
    });

    it('renders section with title', () => {
        render(<SupportSection content={mockContent} />);
        expect(screen.getByText(aboutUsPageUk.SUPPORT_TITLE)).toBeInTheDocument();
    });

    it('renders all support cards', () => {
        render(<SupportSection content={mockContent} />);

        expect(screen.getByText('Description 1')).toBeInTheDocument();
        expect(screen.getByText('Description 2')).toBeInTheDocument();
        expect(screen.getByText('Description 3')).toBeInTheDocument();
    });

    it('renders tablet version when viewport is tablet size', () => {
        mockedUseMediaQuery.mockReturnValue(true);

        const { container } = render(<SupportSection content={mockContent} />);

        expect(container.querySelector('.support-columns')).toBeInTheDocument();
    });

    it('renders desktop/mobile version when viewport is not tablet', () => {
        mockedUseMediaQuery.mockReturnValue(false);

        const { container } = render(<SupportSection content={mockContent} />);

        expect(container.querySelector('.support-block')).toBeInTheDocument();
    });

    it('handles null content gracefully', () => {
        const { container } = render(<SupportSection content={null} />);

        expect(container.querySelector('.support-block')).toBeInTheDocument();
    });

    it('handles empty content array', () => {
        const { container } = render(<SupportSection content={[]} />);

        expect(container.querySelector('.support-block')).toBeInTheDocument();
    });

    it('renders with single content item', () => {
        const singleContent = [mockContent[0]];

        render(<SupportSection content={singleContent} />);

        expect(screen.getByText('Description 1')).toBeInTheDocument();
        expect(screen.queryByText('Description 2')).not.toBeInTheDocument();
    });

    it('renders content without images using default images', () => {
        const contentWithoutImages: AboutUsContent[] = mockContent.map((item) => ({
            ...item,
            image: null,
        }));

        const { container } = render(<SupportSection content={contentWithoutImages} />);

        expect(screen.getByText('Description 1')).toBeInTheDocument();
        expect(container.querySelectorAll('img').length).toBeGreaterThan(0);
    });

    it('applies correct CSS class to container', () => {
        const { container } = render(<SupportSection content={mockContent} />);

        expect(container.querySelector('.support-block')).toBeInTheDocument();
    });

    it('renders title with correct CSS class', () => {
        const { container } = render(<SupportSection content={mockContent} />);

        expect(container.querySelector('.support-title')).toBeInTheDocument();
    });
});
