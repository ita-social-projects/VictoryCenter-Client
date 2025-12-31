import React from 'react';
import { render, screen } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { SummarySection } from './SummarySection';

jest.mock('./SummarySection.module.scss', () => ({
    root: 'root-class',
    collected: 'collected-class',
    expenses: 'expenses-class',
    income: 'income-class',
    programs: 'programs-class',
    lives: 'lives-class',
}));

jest.mock('@/utils/mock-data/public/reports-page', () => ({
    SUMMARY_DATA: {
        collected: {
            uah: 100000,
            usd: 2500,
        },
        livesChanged: 42,
    },
}));

jest.mock('react-i18next', () => ({
    useTranslation: jest.fn(),
}));

jest.mock('./stat-card', () => ({
    StatCard: (props: any) => <div data-testid="stat-card-mock" data-props={JSON.stringify(props)} />,
}));

describe('SummarySection', () => {
    const mockT = (key: string) => key;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const setupTranslation = (language: string) => {
        (useTranslation as jest.Mock).mockReturnValue({
            t: mockT,
            i18n: { language },
        });
    };

    it('renders layout structure correctly', () => {
        setupTranslation('en');
        const { container } = render(<SummarySection />);
        const root = container.firstChild;

        expect(root).toHaveClass('root-class');
        expect(container.querySelector('.expenses-class')).toHaveTextContent('Основні витрати');
        expect(container.querySelector('.income-class')).toHaveTextContent('Звідки прийшли кошти');
        expect(container.querySelector('.programs-class')).toHaveTextContent('Розподіл коштів по програмах');
    });

    it('renders correct data for Ukrainian language (UAH)', () => {
        setupTranslation('uk');
        render(<SummarySection />);

        const statCards = screen.getAllByTestId('stat-card-mock');
        expect(statCards).toHaveLength(2);

        const collectedProps = JSON.parse(statCards[0].getAttribute('data-props') || '{}');
        expect(collectedProps).toEqual({
            className: 'collected-class',
            value: 100000,
            currency: 'UAH',
            label: 'summary.collected',
            color: 'blue',
        });
    });

    it('renders correct data for English language (USD)', () => {
        setupTranslation('en');
        render(<SummarySection />);

        const statCards = screen.getAllByTestId('stat-card-mock');

        const collectedProps = JSON.parse(statCards[0].getAttribute('data-props') || '{}');
        expect(collectedProps).toEqual({
            className: 'collected-class',
            value: 2500,
            currency: 'USD',
            label: 'summary.collected',
            color: 'blue',
        });
    });

    it('renders lives changed card correctly (static data)', () => {
        setupTranslation('en');
        render(<SummarySection />);

        const statCards = screen.getAllByTestId('stat-card-mock');

        const livesProps = JSON.parse(statCards[1].getAttribute('data-props') || '{}');
        expect(livesProps).toEqual({
            className: 'lives-class',
            value: 42,
            label: 'summary.lives',
            color: 'yellow',
        });
    });
});
