import { render, screen } from '@testing-library/react';
import { AboutUsIntro } from './IntroSection';
import { ABOUT_US_DATA } from '../../../../const/public/about-us-page';

describe('AboutUsIntro', () => {
    it('should render images correctly', () => {
        render(<AboutUsIntro />);
        const images = screen.getAllByAltText('Men and Horse');
        expect(images).toHaveLength(2);
        expect(images[0]).toHaveClass('background-img');
        expect(images[1]).toHaveClass('color-overlay');
    });

    it('should render highlighted text correctly', () => {
        render(<AboutUsIntro />);
        const title = screen.getByRole('heading', { level: 1 });
        expect(title).toBeInTheDocument();
        expect(title).toHaveTextContent(ABOUT_US_DATA.INTRO_TITLE.FIRST_HIGHLIGHT);
        expect(title).toHaveTextContent(ABOUT_US_DATA.INTRO_TITLE.MIDDLE_PART);
        expect(title).toHaveTextContent(ABOUT_US_DATA.INTRO_TITLE.SECOND_HIGHLIGHT);

        const highlightedSpans = document.querySelectorAll('.highlighted');
        expect(highlightedSpans).toHaveLength(2);
    });

    it('should render title details correctly', () => {
        render(<AboutUsIntro />);
        Object.values(ABOUT_US_DATA.INTRO_DETAILS).forEach((line) => {
            const paragraph = screen.queryByText((text) => text.trim().includes(line.trim()));
            expect(paragraph).toBeInTheDocument();
        });
    });
});
