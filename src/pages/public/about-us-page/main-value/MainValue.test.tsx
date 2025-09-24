import { render, screen } from '@testing-library/react';
import { MainValues } from './MainValue';
import aboutUsUk from '../../../../locales/uk/about-us.json';

describe('MainValues component', () => {
    it('should render main title with correct parts and highlights', () => {
        render(<MainValues />);
        checkForSubstrings(aboutUsUk['MAIN_VALUE.FIRST_PART']);
        checkForSubstrings(aboutUsUk['MAIN_VALUE.FIRST_HIGHLIGHT']);
        checkForSubstrings(aboutUsUk['MAIN_VALUE.MIDDLE_PART']);
        checkForSubstrings(aboutUsUk['MAIN_VALUE.SECOND_HIGHLIGHT']);
    });

    it('should render correct number of people cards', () => {
        render(<MainValues />);
        const cards = screen.getAllByRole('img');
        expect(cards.length).toBe(aboutUsUk.PEOPLE_DATA.length);
    });

    it('should render correct people info texts', () => {
        render(<MainValues />);
        aboutUsUk.PEOPLE_DATA.forEach(({ INFO }) => {
            expect(screen.getByText(INFO)).toBeInTheDocument();
        });
    });

    it('should render summary block with correct lines', () => {
        render(<MainValues />);
        checkForSubstrings(aboutUsUk['MAIN_VALUE_DETAILS.FIRST_LINE']);
        checkForSubstrings(aboutUsUk['MAIN_VALUE_DETAILS.SECOND_LINE']);
        checkForSubstrings(aboutUsUk['MAIN_VALUE_DETAILS.THIRD_LINE']);
    });
});

const checkForSubstrings = (line: string) => {
    expect(screen.getByText((content) => content.includes(line.trim()))).toBeInTheDocument();
};
