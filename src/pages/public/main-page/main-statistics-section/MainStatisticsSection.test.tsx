import { render, screen, act } from '@testing-library/react';
import { MainStatisticsSection } from './MainStatisticsSection';
import { PublicImpactStatisticDto, MetricPrefix, MetricType, PublicMetricDto } from '@/types/public/main-page';

jest.mock('@/hooks/common/use-locale/useLocale', () => ({
    useLocale: () => ({ currentLanguage: 'uk' }),
}));

let ioCallback: (entries: Partial<IntersectionObserverEntry>[]) => void;
const mockObserve = jest.fn();
const mockDisconnect = jest.fn();

jest.mock('@/hooks/common/use-scroll-animation/useScrollAnimation', () => ({
    useScrollAnimation: () => {
        const React = require('react');
        const ref = React.useRef(null);
        const [isVisible, setIsVisible] = React.useState(false);
        (globalThis as any).__triggerVisible = () => setIsVisible(true);
        return { ref, isVisible };
    },
}));

jest.mock('@/utils/functions/image-helper/image-helper', () => ({
    getImageSrc: (img: any) => (img?.url ? img.url : ''),
}));

jest.mock('./MainStatisticsSection.module.scss', () => ({
    root: 'root',
    'image-wrapper': 'image-wrapper',
    image: 'image',
    'content-block': 'content-block',
    title: 'title',
    'metrics-grid': 'metrics-grid',
    metric: 'metric',
    'metric-value': 'metric-value',
    'metric-name': 'metric-name',
}));

const makeMetric = (
    id: number,
    value: number,
    name: string,
    type: MetricType = MetricType.Partners,
    prefix: MetricPrefix | null = null,
    priority = id,
): PublicMetricDto => ({
    id,
    value,
    name,
    type,
    prefix,
    priority,
    localizations: [],
});

const makeStatistics = (overrides: Partial<PublicImpactStatisticDto> = {}): PublicImpactStatisticDto => ({
    id: 1,
    title: 'Зміни, які можна виміряти',
    image: { id: 10, url: '/stats-image.jpg', mimeType: 'image/jpeg' },
    metrics: [
        makeMetric(1, 20, 'партнерств', MetricType.Partners, MetricPrefix.Plus),
        makeMetric(2, 21, 'програм підтримки', MetricType.Programs),
        makeMetric(3, 1249854, 'зібрано', MetricType.Raised),
        makeMetric(4, 140, 'годин терапії з кіньми', MetricType.TherapyHours, MetricPrefix.Plus),
    ],
    localizations: [],
    ...overrides,
});

describe('MainStatisticsSection', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    it('renders nothing when impactStatistics is null', () => {
        const { container } = render(<MainStatisticsSection impactStatistics={null} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders nothing when impactStatistics is undefined', () => {
        const { container } = render(<MainStatisticsSection impactStatistics={undefined} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders nothing when metrics array is empty', () => {
        const { container } = render(<MainStatisticsSection impactStatistics={makeStatistics({ metrics: [] })} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders the section title', () => {
        render(<MainStatisticsSection impactStatistics={makeStatistics()} />);
        expect(screen.getByText('Зміни, які можна виміряти')).toBeInTheDocument();
    });

    it('renders the image when imageSrc is non-empty', () => {
        render(<MainStatisticsSection impactStatistics={makeStatistics()} />);
        const img = document.querySelector('img');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', '/stats-image.jpg');
    });

    it('does not render an image when image is null', () => {
        render(<MainStatisticsSection impactStatistics={makeStatistics({ image: null })} />);
        expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument();
    });

    it('renders all metric names', () => {
        render(<MainStatisticsSection impactStatistics={makeStatistics()} />);
        expect(screen.getByText('партнерств')).toBeInTheDocument();
        expect(screen.getByText('програм підтримки')).toBeInTheDocument();
        expect(screen.getByText('зібрано')).toBeInTheDocument();
        expect(screen.getByText('годин терапії з кіньми')).toBeInTheDocument();
    });

    it('starts all metric values at 0 before animation triggers', () => {
        const { container } = render(<MainStatisticsSection impactStatistics={makeStatistics()} />);
        const valueSpans = container.querySelectorAll('.metric-value');
        valueSpans.forEach((span) => {
            expect(span.textContent).toMatch(/^0/);
        });
        expect(valueSpans).toHaveLength(4);
    });

    it('animates counters to their target values when section becomes visible', () => {
        render(<MainStatisticsSection impactStatistics={makeStatistics()} />);

        act(() => {
            (globalThis as any).__triggerVisible();
        });

        act(() => {
            jest.runAllTimers();
        });

        expect(screen.getByText('20+')).toBeInTheDocument();
        expect(screen.getByText('21')).toBeInTheDocument();
        expect(screen.getByText('140+')).toBeInTheDocument();
    });

    it('appends "грн" suffix for Raised type metrics', () => {
        render(<MainStatisticsSection impactStatistics={makeStatistics()} />);

        act(() => {
            (globalThis as any).__triggerVisible();
        });
        act(() => {
            jest.runAllTimers();
        });

        expect(screen.getByText(/грн/)).toBeInTheDocument();
    });

    it('uses localized metric name when available for current language', () => {
        const stats = makeStatistics({
            metrics: [
                {
                    id: 1,
                    value: 5,
                    name: 'partners (default)',
                    type: MetricType.Partners,
                    prefix: null,
                    priority: 1,
                    localizations: [
                        {
                            entityId: 1,
                            localizationInfoDto: { id: 1, code: 'uk' },
                            translationStatus: 'Relevant' as any,
                            name: 'партнерів (uk)',
                        },
                    ],
                },
            ],
        });

        render(<MainStatisticsSection impactStatistics={stats} />);
        expect(screen.getByText('партнерів (uk)')).toBeInTheDocument();
    });

    it('falls back to default metric name when no matching localization', () => {
        const stats = makeStatistics({
            metrics: [
                {
                    id: 1,
                    value: 5,
                    name: 'partners fallback',
                    type: MetricType.Partners,
                    prefix: null,
                    priority: 1,
                    localizations: [],
                },
            ],
        });

        render(<MainStatisticsSection impactStatistics={stats} />);
        expect(screen.getByText('partners fallback')).toBeInTheDocument();
    });

    it('renders metrics ordered by priority', () => {
        const stats = makeStatistics({
            metrics: [
                makeMetric(3, 100, 'Third', MetricType.Partners, null, 3),
                makeMetric(1, 50, 'First', MetricType.Partners, null, 1),
                makeMetric(2, 75, 'Second', MetricType.Partners, null, 2),
            ],
        });

        render(<MainStatisticsSection impactStatistics={stats} />);

        const metricNames = screen.getAllByText(/First|Second|Third/);
        expect(metricNames[0]).toHaveTextContent('First');
        expect(metricNames[1]).toHaveTextContent('Second');
        expect(metricNames[2]).toHaveTextContent('Third');
    });

    it('renders figure role for each metric for accessibility', () => {
        render(<MainStatisticsSection impactStatistics={makeStatistics()} />);
        const figures = screen.getAllByRole('figure');
        expect(figures).toHaveLength(4);
    });
});
