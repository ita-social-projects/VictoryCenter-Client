import { render, screen } from '@testing-library/react';
import { MainValues } from './MainValue';
import aboutUsPageUk from '../../../../locales/uk/about-us.json';

describe('MainValues component', () => {
    it('should render main title with correct parts and highlights', () => {
        render(<MainValues />);
        checkForSubstrings(aboutUsPageUk['MAIN_VALUE.FIRST_PART']);
        checkForSubstrings(aboutUsPageUk['MAIN_VALUE.FIRST_HIGHLIGHT']);
        checkForSubstrings(aboutUsPageUk['MAIN_VALUE.MIDDLE_PART']);
        checkForSubstrings(aboutUsPageUk['MAIN_VALUE.SECOND_HIGHLIGHT']);
    });

    it('should render correct number of people cards', () => {
        render(<MainValues />);
        const cards = screen.getAllByRole('img');
        expect(cards.length).toBe(aboutUsPageUk.PEOPLE_DATA.length);
    });

    it('should render correct people info texts', () => {
        render(<MainValues />);
        aboutUsPageUk.PEOPLE_DATA.forEach(({ INFO }) => {
            expect(screen.getByText(INFO)).toBeInTheDocument();
        });
    });

    it('should render summary block with correct lines', () => {
        render(<MainValues />);
        checkForSubstrings(aboutUsPageUk['MAIN_VALUE_DETAILS.FIRST_LINE']);
        checkForSubstrings(aboutUsPageUk['MAIN_VALUE_DETAILS.SECOND_LINE']);
        checkForSubstrings(aboutUsPageUk['MAIN_VALUE_DETAILS.THIRD_LINE']);
    });
});

const checkForSubstrings = (line: string) => {
    expect(screen.getByText((content) => content.includes(line.trim()))).toBeInTheDocument();
};
