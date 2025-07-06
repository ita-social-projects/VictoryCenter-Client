import React from 'react';
import { render, screen } from '@testing-library/react';
import { MainValues } from './MainValue';
import { peopleData } from '../../../const/about-us-page/about-us-page';

describe('MainValues component', () => {

    test('renders main title with correct parts and highlights', () => {
        render(<MainValues />);
        expect(screen.getByText(/Головна /i)).toBeInTheDocument();
        expect(screen.getByText(/цінність/i)).toBeInTheDocument();
        expect(screen.getByText(/Victory Center/i)).toBeInTheDocument();
        expect(screen.getByText(/це люди/i)).toBeInTheDocument();
    });

    test('renders correct number of people cards', () => {
        render(<MainValues />);
        const cards = screen.getAllByRole('img');
        expect(cards.length).toBe(peopleData.length);
    });

    test('renders correct people info texts', () => {
        render(<MainValues />);
        peopleData.forEach(({ info }) => {
            expect(screen.getByText(info)).toBeInTheDocument();
        });
    });

    test('renders summary block with correct lines', () => {
        render(<MainValues />);
        expect(screen.getByText(/Ми віримо в силу спільноти, в якій кожен голос /i)).toBeInTheDocument();
        expect(screen.getByText(/важливий, а кожен крок - наближує до спільної /i)).toBeInTheDocument();
        expect(screen.getByText(/перемоги./i)).toBeInTheDocument();
    });
});
