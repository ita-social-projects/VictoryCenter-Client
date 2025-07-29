import React from 'react';
import { render, screen } from '@testing-library/react';
import { MainValues } from './MainValue';
import { ABOUT_US_DATA } from '../../../../const/public/about-us-page';

describe('MainValues component', () => {
    it('should render main title with correct parts and highlights', () => {
        render(<MainValues />);
        expect(screen.getByText(/Головна /i)).toBeInTheDocument();
        expect(screen.getByText(/цінність/i)).toBeInTheDocument();
        expect(screen.getByText(/Victory Center/i)).toBeInTheDocument();
        expect(screen.getByText(/це люди/i)).toBeInTheDocument();
    });

    it('should render correct number of people cards', () => {
        render(<MainValues />);
        const cards = screen.getAllByRole('img');
        expect(cards.length).toBe(ABOUT_US_DATA.PEOPLE_DATA.length);
    });

    it('should render correct people info texts', () => {
        render(<MainValues />);
        ABOUT_US_DATA.PEOPLE_DATA.forEach(({ INFO }) => {
            expect(screen.getByText(INFO)).toBeInTheDocument();
        });
    });

    it('should render summary block with correct lines', () => {
        render(<MainValues />);
        expect(screen.getByText(/Ми віримо в силу спільноти, в якій кожен голос /i)).toBeInTheDocument();
        expect(screen.getByText(/важливий, а кожен крок - наближує до спільної /i)).toBeInTheDocument();
        expect(screen.getByText(/перемоги./i)).toBeInTheDocument();
    });
});
