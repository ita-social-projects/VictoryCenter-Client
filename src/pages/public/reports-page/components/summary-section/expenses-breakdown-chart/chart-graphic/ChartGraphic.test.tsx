import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChartGraphic } from './ChartGraphic';
import { useMediaQuery } from '@/hooks/common/use-media-query/useMediaQuery';
import { useChartGeometry } from '../use-chart-geometry/useChartGeometry';

jest.mock('@/hooks/common/use-media-query/useMediaQuery', () => ({
    useMediaQuery: jest.fn(),
}));

jest.mock('../use-chart-geometry/useChartGeometry', () => ({
    useChartGeometry: jest.fn(),
}));

jest.mock('./chart.config', () => ({
    CHART_CONFIG: {
        desktop: {
            height: 400,
            wrapperWidth: 600,
            viewBox: '0 0 400 400',
            svgWidth: 400,
            strokeWidth: 20,
            arcs: ['M0 0', 'M10 10'],
        },
        mobile: {
            height: 200,
            wrapperWidth: 300,
            viewBox: '0 0 200 200',
            svgWidth: 200,
            strokeWidth: 10,
            arcs: ['M0 0', 'M5 5'],
        },
    },
}));

const mockedUseMediaQuery = useMediaQuery as jest.Mock;
const mockedUseChartGeometry = useChartGeometry as jest.Mock;

const defaultFormatAmount = (amount: number) => `${amount.toLocaleString('uk-UA')} грн`;

describe('ChartGraphic', () => {
    const items = [
        { label: 'A', percent: 25, amount: 1000 },
        { label: 'B', percent: 75, amount: 3000 },
    ];

    beforeEach(() => {
        mockedUseChartGeometry.mockReturnValue({
            pathRefs: { current: [] },
            positions: [
                { x: 100, y: 100 },
                { x: 200, y: 200 },
            ],
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders desktop config when media query matches', () => {
        mockedUseMediaQuery.mockReturnValue(true);

        render(<ChartGraphic items={items} formatAmount={defaultFormatAmount} />);

        const svg = document.querySelector('svg');

        expect(svg).toHaveAttribute('viewBox', '0 0 400 400');
    });

    it('renders mobile config when media query does not match', () => {
        mockedUseMediaQuery.mockReturnValue(false);

        render(<ChartGraphic items={items} formatAmount={defaultFormatAmount} />);

        const svg = document.querySelector('svg');

        expect(svg).toHaveAttribute('viewBox', '0 0 200 200');
    });

    it('renders correct number of paths', () => {
        mockedUseMediaQuery.mockReturnValue(true);

        render(<ChartGraphic items={items} formatAmount={defaultFormatAmount} />);

        const paths = document.querySelectorAll('path');

        expect(paths).toHaveLength(2);
    });

    it('renders labels with formatted percent and amount', () => {
        mockedUseMediaQuery.mockReturnValue(true);

        const spyFormatAmount = jest.fn(defaultFormatAmount);

        render(<ChartGraphic items={items} formatAmount={spyFormatAmount} />);

        expect(screen.getByText('25.0%')).toBeInTheDocument();
        expect(screen.getByText('75.0%')).toBeInTheDocument();

        expect(spyFormatAmount).toHaveBeenCalledWith(1000);
        expect(spyFormatAmount).toHaveBeenCalledWith(3000);
    });

    it('does not render label if position is missing', () => {
        mockedUseMediaQuery.mockReturnValue(true);

        mockedUseChartGeometry.mockReturnValue({
            pathRefs: { current: [] },
            positions: [undefined, { x: 200, y: 200 }],
        });

        render(<ChartGraphic items={items} formatAmount={defaultFormatAmount} />);

        expect(screen.queryByText('25.0%')).not.toBeInTheDocument();
        expect(screen.getByText('75.0%')).toBeInTheDocument();
    });

    it('calls useChartGeometry with correct arguments', () => {
        mockedUseMediaQuery.mockReturnValue(true);

        render(<ChartGraphic items={items} formatAmount={defaultFormatAmount} />);

        expect(mockedUseChartGeometry).toHaveBeenCalledWith(items.length, true, [25, 75]);
    });
});
