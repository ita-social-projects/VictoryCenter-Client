import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { CompanyValues } from './CompanyValues';
import aboutUsUk from '../../../../locales/uk/about-us.json';

describe('Company Values Section', () => {
    it('should contain main title', () => {
        render(<CompanyValues />);
        const title = screen.getByRole('heading', { name: aboutUsUk.OUR_VALUES });
        expect(title).toBeInTheDocument();
        expect(title).toHaveClass('values-title');
    });

    it('should contain value cards', () => {
        render(<CompanyValues />);
        const cards = document.querySelectorAll('.value-card');
        expect(cards.length).toEqual(3);
        expect(cards[0]).toHaveClass('value-card');
        expect(cards[1]).toHaveClass('value-card');
        expect(cards[2]).toHaveClass('value-card');

        const values = document.querySelectorAll('.value-item');
        expect(values.length).toEqual(9);
    });

    it('should contain correct text', () => {
        render(<CompanyValues />);
        aboutUsUk.VALUE_ITEMS.forEach(({ NAME, DESCRIPTION }) => {
            expect(screen.getByRole('heading', { name: NAME })).toBeInTheDocument();
            expect(screen.getByText(DESCRIPTION)).toBeInTheDocument();
        });
    });

    it('should render in correct container', () => {
        const { container } = render(<CompanyValues />);
        expect(container.querySelector('.values-block')).toBeInTheDocument();
        const title = document.querySelector('.values-title')?.closest('.values-block');
        expect(title).toBeInTheDocument();
    });
});
