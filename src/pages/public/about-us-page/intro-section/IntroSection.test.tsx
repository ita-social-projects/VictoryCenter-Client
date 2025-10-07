import { render, screen } from '@testing-library/react';
import { AboutUsIntro } from './IntroSection';
import aboutUsPageUk from '../../../../locales/uk/about-us.json';

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
        expect(title).toHaveTextContent(aboutUsPageUk['INTRO_TITLE.FIRST_HIGHLIGHT']);
        expect(title).toHaveTextContent(aboutUsPageUk['INTRO_TITLE.MIDDLE_PART']);
        expect(title).toHaveTextContent(aboutUsPageUk['INTRO_TITLE.SECOND_HIGHLIGHT']);

        const highlightedSpans = document.querySelectorAll('.highlighted');
        expect(highlightedSpans).toHaveLength(2);
    });

    it('should render title details correctly', () => {
        render(<AboutUsIntro />);
        prepareAndFindTitleDetails(aboutUsPageUk['INTRO_DETAILS.FIRST_LINE']);
        prepareAndFindTitleDetails(aboutUsPageUk['INTRO_DETAILS.SECOND_LINE']);
        prepareAndFindTitleDetails(aboutUsPageUk['INTRO_DETAILS.THIRD_LINE']);
        prepareAndFindTitleDetails(aboutUsPageUk['INTRO_DETAILS.FOURTH_LINE']);
        prepareAndFindTitleDetails(aboutUsPageUk['INTRO_DETAILS.FIFTH_LINE']);
    });
});

const prepareAndFindTitleDetails = (line: string) => {
    const paragraph = screen.queryByText((text) => text.trim().includes(line.trim()));
    expect(paragraph).toBeInTheDocument();
};
