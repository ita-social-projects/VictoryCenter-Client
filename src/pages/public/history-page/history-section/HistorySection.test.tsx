import { render, screen } from '@testing-library/react';
import { HistorySection } from './HistorySection';
import { useGetLocalization } from '@/hooks/common/use-get-localization/useGetLocalization';
import { useScrollAnimation } from '@/hooks/common/use-scroll-animation/useScrollAnimation';
import { SectionTemplate } from '@/types/common/sections';
import { ContentType } from '@/types/common/section-contents';
import { HistorySection as HistorySectionModel } from '@/types/public/history-page';

jest.mock('@/hooks/common/use-get-localization/useGetLocalization');
jest.mock('@/hooks/common/use-scroll-animation/useScrollAnimation');
jest.mock('./HistoryQuadImages', () => ({
    HistoryQuadImages: () => <div data-testid="quad-images" />,
}));
jest.mock('./HistoryDualImages', () => ({
    HistoryDualImages: () => <div data-testid="dual-images" />,
}));

const mockedUseGetLocalization = jest.mocked(useGetLocalization);
const mockedUseScrollAnimation = jest.mocked(useScrollAnimation);

const makeSection = (
    template: SectionTemplate,
    overrides: Partial<HistorySectionModel> = {},
): HistorySectionModel => ({
    id: 1,
    template,
    order: 0,
    contents: [
        { id: 10, contentType: ContentType.Title, order: 0, title: '2024 — Весна', description: null, image: null, localizations: [] },
        { id: 11, contentType: ContentType.Description, order: 1, title: null, description: 'Опис події', image: null, localizations: [] },
    ],
    ...overrides,
});

describe('HistorySection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedUseScrollAnimation.mockReturnValue({ ref: { current: null }, isVisible: true });
        // Default: pass-through to fallback — individual tests override when needed
        mockedUseGetLocalization.mockImplementation((_, fallback) => fallback as ReturnType<typeof useGetLocalization>);
    });

    describe('TextOnly template', () => {
        it('should render title and description', () => {
            render(<HistorySection section={makeSection(SectionTemplate.TextOnly)} />);

            expect(screen.getByText('ВЕСНА')).toBeInTheDocument();
            expect(screen.getByText('Опис події')).toBeInTheDocument();
        });

        it('should not render image grids', () => {
            render(<HistorySection section={makeSection(SectionTemplate.TextOnly)} />);

            expect(screen.queryByTestId('quad-images')).not.toBeInTheDocument();
            expect(screen.queryByTestId('dual-images')).not.toBeInTheDocument();
        });
    });

    describe('SingleImageRight template', () => {
        const sectionWithImage = makeSection(SectionTemplate.SingleImageRight, {
            contents: [
                { id: 10, contentType: ContentType.Title, order: 0, title: '2024 — Березень', description: null, image: null, localizations: [] },
                { id: 11, contentType: ContentType.Description, order: 1, title: null, description: 'Опис', image: null, localizations: [] },
                { id: 12, contentType: ContentType.Image, order: 2, title: null, description: null, image: { id: 1, url: 'https://example.com/img.jpg', mimeType: 'image/jpeg' }, localizations: [] },
            ],
        });

        it('should render an image element', () => {
            render(<HistorySection section={sectionWithImage} />);

            // Images with alt="" have role="presentation" per ARIA spec
            expect(screen.getByRole('presentation')).toBeInTheDocument();
        });
    });

    describe('QuadImagesBottom template', () => {
        it('should render HistoryQuadImages component', () => {
            const section = makeSection(SectionTemplate.QuadImagesBottom, {
                contents: [
                    { id: 10, contentType: ContentType.Title, order: 0, title: '2024', description: null, image: null, localizations: [] },
                    { id: 11, contentType: ContentType.Description, order: 1, title: null, description: 'Текст', image: null, localizations: [] },
                    { id: 12, contentType: ContentType.Image, order: 2, title: null, description: null, image: { id: 1, url: 'https://example.com/a.jpg', mimeType: 'image/jpeg' }, localizations: [] },
                ],
            });

            render(<HistorySection section={section} />);

            expect(screen.getByTestId('quad-images')).toBeInTheDocument();
        });
    });

    describe('DualImagesBottom template', () => {
        it('should render HistoryDualImages component', () => {
            const section = makeSection(SectionTemplate.DualImagesBottom, {
                contents: [
                    { id: 10, contentType: ContentType.Title, order: 0, title: null, description: null, image: null, localizations: [] },
                    { id: 11, contentType: ContentType.Description, order: 1, title: null, description: null, image: null, localizations: [] },
                    { id: 12, contentType: ContentType.Image, order: 2, title: null, description: null, image: { id: 1, url: 'https://example.com/a.jpg', mimeType: 'image/jpeg' }, localizations: [] },
                ],
            });

            render(<HistorySection section={section} />);

            expect(screen.getByTestId('dual-images')).toBeInTheDocument();
        });
    });

    describe('year label', () => {
        it('should show year label when showYearLabel is true', () => {
            render(<HistorySection section={makeSection(SectionTemplate.TextOnly)} showYearLabel={true} />);

            expect(screen.getByText(/2024/)).toBeInTheDocument();
        });

        it('should hide year label when showYearLabel is false', () => {
            render(<HistorySection section={makeSection(SectionTemplate.TextOnly)} showYearLabel={false} />);

            expect(screen.queryByText(/2024 рік/)).not.toBeInTheDocument();
        });
    });

    describe('localization', () => {
        it('should display localized title and description when useGetLocalization returns a translation', () => {
            mockedUseGetLocalization
                .mockImplementationOnce(() => ({ title: '2024 — Spring' }) as ReturnType<typeof useGetLocalization>)
                .mockImplementationOnce(() => ({ description: 'Event description' }) as ReturnType<typeof useGetLocalization>);

            render(<HistorySection section={makeSection(SectionTemplate.TextOnly)} />);

            expect(screen.getByText('SPRING')).toBeInTheDocument();
            expect(screen.getByText('Event description')).toBeInTheDocument();
        });

        it('should not render heading when localization and base title are both null', () => {
            const sectionNoTitle = makeSection(SectionTemplate.TextOnly, {
                contents: [
                    { id: 10, contentType: ContentType.Title, order: 0, title: null, description: null, image: null, localizations: [] },
                    { id: 11, contentType: ContentType.Description, order: 1, title: null, description: 'Опис', image: null, localizations: [] },
                ],
            });

            render(<HistorySection section={sectionNoTitle} />);

            expect(screen.queryByRole('heading')).not.toBeInTheDocument();
        });
    });
});
