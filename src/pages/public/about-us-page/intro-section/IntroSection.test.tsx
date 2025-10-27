import { render, screen } from '@testing-library/react';
import { AboutUsIntro } from './IntroSection';
import { ContentType } from '../../../../types/common/about-us';
import { AboutUsContent } from '../../../../types/public/about-us-page';
import { ABOUT_US_DATA } from '../../../../const/public/about-us-page';

describe('AboutUsIntro', () => {
    const Content: AboutUsContent[] = [
        {
            contentType: ContentType.Title,
            title: 'Test title',
            id: 1,
            image: null,
            description: null,
        },
        {
            contentType: ContentType.Description,
            description: 'Test description',
            id: 2,
            image: null,
            title: null,
        },
        {
            contentType: ContentType.Image,
            image: {
                id: null,
                url: 'test.jpg',
                mimeType: 'image.jpeg',
            },
            description: null,
            id: 3,
            title: null,
        },
    ];

    it('should render default images correctly', () => {
        render(<AboutUsIntro content={null} />);
        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(2);
        expect(images[0]).toHaveClass('background-img');
        expect(images[1]).toHaveClass('color-overlay');
    });

    it('should render custom images correctly', () => {
        render(<AboutUsIntro content={Content} />);
        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(2);
        expect(images[0]).toHaveAttribute('src', 'test.jpg');
        expect(images[1]).toHaveAttribute('src', 'test.jpg');
        expect(images[0]).toHaveClass('background-img');
        expect(images[1]).toHaveClass('color-overlay');
    });

    it('should render title and description correctly', () => {
        render(<AboutUsIntro content={Content} />);
        // TODO: Replace with: "expect(screen.getByText('Test title')).toBeInTheDocument();" when rich text component is implemented
        expect(screen.getByText(ABOUT_US_DATA.INTRO_TITLE.FIRST_HIGHLIGHT)).toBeInTheDocument();
        expect(screen.getByText(ABOUT_US_DATA.INTRO_TITLE.MIDDLE_PART.trim())).toBeInTheDocument();
        expect(screen.getByText(ABOUT_US_DATA.INTRO_TITLE.SECOND_HIGHLIGHT)).toBeInTheDocument();

        const description = screen.getByText('Test description');
        expect(description).toBeInTheDocument();
    });
});
