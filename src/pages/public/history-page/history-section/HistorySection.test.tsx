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

type SectionContent = HistorySectionModel['contents'][number];

const makeContent = (
    id: number,
    contentType: ContentType,
    order: number,
    overrides: Partial<SectionContent> = {},
): SectionContent => ({
    id,
    contentType,
    order,
    title: null,
    description: null,
    image: null,
    localizations: [],
    ...overrides,
});

const makeSection = (template: SectionTemplate, overrides: Partial<HistorySectionModel> = {}): HistorySectionModel => ({
    id: 1,
    template,
    order: 0,
    contents: [
        makeContent(10, ContentType.Title, 0, { title: '2024 — Весна' }),
        makeContent(11, ContentType.Description, 1, { description: 'Опис події' }),
    ],
    ...overrides,
});

const TEST_IMAGE = { id: 1, url: 'https://example.com/img.jpg', mimeType: 'image/jpeg' };

describe('HistorySection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedUseScrollAnimation.mockReturnValue({ ref: { current: null }, isVisible: true });
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
        it('should render an image when image is provided', () => {
            const section = makeSection(SectionTemplate.SingleImageRight, {
                contents: [
                    makeContent(10, ContentType.Title, 0, { title: '2024 — Березень' }),
                    makeContent(11, ContentType.Description, 1, { description: 'Опис' }),
                    makeContent(12, ContentType.Image, 2, { image: TEST_IMAGE }),
                ],
            });

            render(<HistorySection section={section} />);

            expect(screen.getByRole('presentation')).toBeInTheDocument();
        });

        it('should not render image when no image is provided', () => {
            render(<HistorySection section={makeSection(SectionTemplate.SingleImageRight)} />);

            expect(screen.queryByRole('presentation')).not.toBeInTheDocument();
        });
    });

    describe('SingleImageTop template', () => {
        it('should render image above header when image is provided', () => {
            const section = makeSection(SectionTemplate.SingleImageTop, {
                contents: [
                    makeContent(10, ContentType.Title, 0, { title: '2024 — Квітень' }),
                    makeContent(11, ContentType.Description, 1, { description: 'Опис' }),
                    makeContent(12, ContentType.Image, 2, { image: TEST_IMAGE }),
                ],
            });

            render(<HistorySection section={section} />);

            expect(screen.getByRole('presentation')).toBeInTheDocument();
            expect(screen.getByText('КВІТЕНЬ')).toBeInTheDocument();
        });

        it('should fall back to default layout when no image is provided', () => {
            render(<HistorySection section={makeSection(SectionTemplate.SingleImageTop)} />);

            expect(screen.queryByRole('presentation')).not.toBeInTheDocument();
            expect(screen.getByText('ВЕСНА')).toBeInTheDocument();
        });
    });

    describe('QuadImagesBottom template', () => {
        it('should render HistoryQuadImages component', () => {
            const section = makeSection(SectionTemplate.QuadImagesBottom, {
                contents: [
                    makeContent(10, ContentType.Title, 0, { title: '2024' }),
                    makeContent(11, ContentType.Description, 1, { description: 'Текст' }),
                    makeContent(12, ContentType.Image, 2, { image: TEST_IMAGE }),
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
                    makeContent(10, ContentType.Title, 0),
                    makeContent(11, ContentType.Description, 1),
                    makeContent(12, ContentType.Image, 2, { image: TEST_IMAGE }),
                ],
            });

            render(<HistorySection section={section} />);

            expect(screen.getByTestId('dual-images')).toBeInTheDocument();
        });

        it('should sort images by order when multiple images are present', () => {
            const section = makeSection(SectionTemplate.DualImagesBottom, {
                contents: [
                    makeContent(10, ContentType.Title, 0),
                    makeContent(12, ContentType.Image, 3, { image: TEST_IMAGE }),
                    makeContent(13, ContentType.Image, 1, { image: TEST_IMAGE }),
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

        it('should extract year from a standalone year-only title (YEAR_ONLY_PATTERN)', () => {
            const section = makeSection(SectionTemplate.TextOnly, {
                contents: [
                    makeContent(10, ContentType.Title, 0, { title: '2024' }),
                    makeContent(11, ContentType.Description, 1, { description: 'Опис' }),
                ],
            });

            render(<HistorySection section={section} showYearLabel={true} />);

            // Year badge renders "<year><YEAR_SUFFIX>"; UK suffix is " рік"
            expect(screen.getByText('2024 рік')).toBeInTheDocument();
        });

        it('should extract year from a year-range title (e.g. 2024–2025 — Text)', () => {
            const section = makeSection(SectionTemplate.TextOnly, {
                contents: [
                    makeContent(10, ContentType.Title, 0, { title: '2024–2025 — Огляд' }),
                    makeContent(11, ContentType.Description, 1, { description: 'Опис' }),
                ],
            });

            render(<HistorySection section={section} showYearLabel={true} />);

            expect(screen.getByText('2024–2025 рік')).toBeInTheDocument();
        });
    });

    describe('localization', () => {
        it('should display localized title and description when useGetLocalization returns a translation', () => {
            mockedUseGetLocalization
                .mockImplementationOnce(() => ({ title: '2024 — Spring' }) as ReturnType<typeof useGetLocalization>)
                .mockImplementationOnce(
                    () => ({ description: 'Event description' }) as ReturnType<typeof useGetLocalization>,
                );

            render(<HistorySection section={makeSection(SectionTemplate.TextOnly)} />);

            expect(screen.getByText('SPRING')).toBeInTheDocument();
            expect(screen.getByText('Event description')).toBeInTheDocument();
        });

        it('should not render heading when localization and base title are both null', () => {
            const sectionNoTitle = makeSection(SectionTemplate.TextOnly, {
                contents: [
                    makeContent(10, ContentType.Title, 0),
                    makeContent(11, ContentType.Description, 1, { description: 'Опис' }),
                ],
            });

            render(<HistorySection section={sectionNoTitle} />);

            expect(screen.queryByRole('heading')).not.toBeInTheDocument();
        });

        it('should display Ukrainian title and description when EN language is active but no EN translation exists', () => {
            mockedUseGetLocalization
                .mockImplementationOnce((_locs, fallback) => fallback as ReturnType<typeof useGetLocalization>)
                .mockImplementationOnce((_locs, fallback) => fallback as ReturnType<typeof useGetLocalization>);

            const section = makeSection(SectionTemplate.TextOnly, {
                contents: [
                    makeContent(10, ContentType.Title, 0, { title: '2024 — Весна', localizations: [] }),
                    makeContent(11, ContentType.Description, 1, { description: 'Опис події', localizations: [] }),
                ],
            });

            render(<HistorySection section={section} />);

            expect(screen.getByText('ВЕСНА')).toBeInTheDocument();
            expect(screen.getByText('Опис події')).toBeInTheDocument();
        });

        it('should display Ukrainian title when EN language is active and localizations list is empty (SingleImageRight template)', () => {
            mockedUseGetLocalization
                .mockImplementationOnce((_locs, fallback) => fallback as ReturnType<typeof useGetLocalization>)
                .mockImplementationOnce((_locs, fallback) => fallback as ReturnType<typeof useGetLocalization>);

            const section = makeSection(SectionTemplate.SingleImageRight, {
                contents: [
                    makeContent(10, ContentType.Title, 0, { title: '2024 — Осінь', localizations: [] }),
                    makeContent(11, ContentType.Description, 1, { description: 'Осінній опис', localizations: [] }),
                    makeContent(12, ContentType.Image, 2, { image: TEST_IMAGE }),
                ],
            });

            render(<HistorySection section={section} />);

            expect(screen.getByText('ОСІНЬ')).toBeInTheDocument();
            expect(screen.getByText('Осінній опис')).toBeInTheDocument();
        });

        it('should pass section localizations to useGetLocalization for title content', () => {
            const titleLocalizations = [
                {
                    language: { id: 1, code: 'en' },
                    translationStatus: 1,
                    title: '2024 — Spring',
                    description: null,
                },
            ];

            const section = makeSection(SectionTemplate.TextOnly, {
                contents: [
                    makeContent(10, ContentType.Title, 0, { title: '2024 — Весна', localizations: titleLocalizations }),
                    makeContent(11, ContentType.Description, 1, { description: 'Опис', localizations: [] }),
                ],
            });

            render(<HistorySection section={section} />);

            expect(mockedUseGetLocalization).toHaveBeenCalledWith(
                titleLocalizations,
                expect.objectContaining({ title: '2024 — Весна' }),
            );
        });
    });
});
