import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatCard } from './StatCard';

jest.mock('./StatCard.module.scss', () => ({
    card: 'card-class',
    wrapper: 'wrapper-class',
    value: 'value-class',
    label: 'label-class',
    'text-blue': 'text-blue-class',
    'text-yellow': 'text-yellow-class',
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        i18n: { language: 'en-US' },
    }),
}));

describe('StatCard', () => {
    it('renders label and formatted value with default props', () => {
        render(<StatCard value={1500} label="Total Users" />);

        const valueElement = screen.getByText('1,500');
        const labelElement = screen.getByText('Total Users');

        expect(valueElement).toBeInTheDocument();
        expect(valueElement).toHaveClass('value-class');
        expect(labelElement).toBeInTheDocument();
        expect(labelElement).toHaveClass('label-class');
    });

    it('formats value as currency when currency prop is provided', () => {
        render(<StatCard value={20000} label="Revenue" currency="USD" />);
        expect(screen.getByText('$20,000')).toBeInTheDocument();
    });

    it('applies default blue color class', () => {
        const { container } = render(<StatCard value={10} label="Test" />);
        const valueElement = container.querySelector('.value-class');

        expect(valueElement).toHaveClass('text-blue-class');
    });

    it('applies yellow color class when specified', () => {
        const { container } = render(<StatCard value={10} label="Test" color="yellow" />);
        const valueElement = container.querySelector('.value-class');

        expect(valueElement).toHaveClass('text-yellow-class');
    });

    it('merges custom className with root styles', () => {
        const { container } = render(<StatCard value={10} label="Test" className="custom-margin" />);
        const rootElement = container.firstChild as HTMLElement;

        expect(rootElement).toHaveClass('card-class');
        expect(rootElement).toHaveClass('custom-margin');
    });

    it('handles zero value correctly', () => {
        render(<StatCard value={0} label="Empty" />);
        expect(screen.getByText('0')).toBeInTheDocument();
    });
});
