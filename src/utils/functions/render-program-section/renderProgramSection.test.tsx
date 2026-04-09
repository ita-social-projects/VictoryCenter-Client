import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { renderProgramSection, RenderProgramSectionParams, getInitialSectionContents } from './renderProgramSection';
import { SectionTemplate, SectionMode } from '@/types/common/program-sections';
import { ContentType } from '@/types/common/programs';

const mockCapturedProps: Record<string, any> = {};

const mockCapture = (key: string, props: any) => {
    mockCapturedProps[key] = props;
};

jest.mock('@/components/common/section-templates/quad-images-bottom/QuadImagesBottom', () => ({
    QuadImagesBottom: (props: any) => {
        mockCapture('QuadImagesBottom', props);
        return <div data-testid="QuadImagesBottom" />;
    },
}));

jest.mock('@/components/common/section-templates/triple-images-bottom/TripleImagesBottom', () => ({
    TripleImagesBottom: (props: any) => {
        mockCapture('TripleImagesBottom', props);
        return <div data-testid="TripleImagesBottom" />;
    },
}));

jest.mock('@/components/common/section-templates/dual-images-bottom/DualImagesBottom', () => ({
    DualImagesBottom: (props: any) => {
        mockCapture('DualImagesBottom', props);
        return <div data-testid="DualImagesBottom" />;
    },
}));

jest.mock('@/components/common/section-templates/text-only/TextOnly', () => ({
    TextOnly: (props: any) => {
        mockCapture('TextOnly', props);
        return <div data-testid="TextOnly" />;
    },
}));

jest.mock('@/components/common/section-templates/single-image-top/SingleImageTop', () => ({
    SingleImageTop: (props: any) => {
        mockCapture('SingleImageTop', props);
        return <div data-testid="SingleImageTop" />;
    },
}));

jest.mock('@/components/common/section-templates/single-image-bottom/SingleImageBottom', () => ({
    SingleImageBottom: (props: any) => {
        mockCapture('SingleImageBottom', props);
        return <div data-testid="SingleImageBottom" />;
    },
}));

jest.mock('@/components/common/section-templates/single-image-right/SingleImageRight', () => ({
    SingleImageRight: (props: any) => {
        mockCapture('SingleImageRight', props);
        return <div data-testid="SingleImageRight" />;
    },
}));

jest.mock('@/components/common/section-templates/title-description-cards/TitleDescriptionCardsWrapper', () => ({
    TitleDescriptionCardsWrapper: (props: any) => {
        mockCapture('TitleDescriptionCardsWrapper', props);
        return <div data-testid="TitleDescriptionCardsWrapper" data-cards-count={String(props.cardsCount)} />;
    },
}));

jest.mock(
    '@/components/common/section-templates/single-title-quintuple-description/SingleTitleQuintupleDescription',
    () => ({
        SingleTitleQuintupleDescription: (props: any) => {
            mockCapture('SingleTitleQuintupleDescription', props);
            return <div data-testid="SingleTitleQuintupleDescription" />;
        },
    }),
);

jest.mock(
    '@/components/common/section-templates/single-title-description-author-pairs/SingleTitleDescriptionAuthorPairs',
    () => ({
        SingleTitleDescriptionAuthorPairs: (props: any) => {
            mockCapture('SingleTitleDescriptionAuthorPairs', props);
            return <div data-testid="SingleTitleDescriptionAuthorPairs" />;
        },
    }),
);

describe('renderProgramSection', () => {
    const baseData = {
        title: 'Title',
        description: 'Desc',
        images: [
            { id: 1, url: 'img1', mimeType: 'image/jpeg' },
            { id: 2, url: 'img2', mimeType: 'image/jpeg' },
            { id: 3, url: 'img3', mimeType: 'image/jpeg' },
            { id: 4, url: 'img4', mimeType: 'image/jpeg' },
        ],
    };

    const baseHandlers = {
        onTitleChange: jest.fn(),
        onDescriptionChange: jest.fn(),
        onImagesChange: jest.fn(),
    };

    beforeEach(() => {
        Object.keys(mockCapturedProps).forEach((k) => delete mockCapturedProps[k]);
        jest.clearAllMocks();
    });

    const imageTemplates = [
        { id: SectionTemplate.QuadImagesBottom, testId: 'QuadImagesBottom' },
        { id: SectionTemplate.TripleImagesBottom, testId: 'TripleImagesBottom' },
        { id: SectionTemplate.DualImagesBottom, testId: 'DualImagesBottom' },
        { id: SectionTemplate.TextOnly, testId: 'TextOnly' },
        { id: SectionTemplate.SingleImageTop, testId: 'SingleImageTop' },
        { id: SectionTemplate.SingleImageBottom, testId: 'SingleImageBottom' },
        { id: SectionTemplate.SingleImageRight, testId: 'SingleImageRight' },
    ];

    describe('Image-based templates', () => {
        imageTemplates.forEach(({ id, testId }) => {
            it(`renders correct component for ${id}`, () => {
                const params: RenderProgramSectionParams = {
                    templateId: id,
                    data: baseData,
                    mode: SectionMode.Edit,
                    handlers: baseHandlers,
                };

                render(renderProgramSection(params));
                expect(screen.getByTestId(testId)).toBeInTheDocument();
            });
        });

        it('maps single-image template to image prop and wraps onImagesChange into onImageChange', () => {
            const params: RenderProgramSectionParams = {
                templateId: SectionTemplate.SingleImageTop,
                data: baseData,
                mode: SectionMode.Edit,
                handlers: baseHandlers,
            };

            render(renderProgramSection(params));

            const props = mockCapturedProps.SingleImageTop;
            expect(props.image).toEqual(baseData.images[0]);
            expect(typeof props.onImageChange).toBe('function');

            const file = { url: 'new', mimeType: 'image/jpeg' } as any;
            props.onImageChange(file);

            expect(baseHandlers.onImagesChange).toHaveBeenCalledWith(0, file);
        });

        it('does not pass onImageChange when handlers.onImagesChange is not provided', () => {
            const handlers = {
                onTitleChange: jest.fn(),
                onDescriptionChange: jest.fn(),
            };

            render(
                renderProgramSection({
                    templateId: SectionTemplate.SingleImageTop,
                    data: baseData,
                    mode: SectionMode.Edit,
                    handlers: handlers as any,
                }),
            );

            expect(mockCapturedProps.SingleImageTop.onImageChange).toBeUndefined();
        });

        it('passes images and onImagesChange to multi-image template', () => {
            const params: RenderProgramSectionParams = {
                templateId: SectionTemplate.DualImagesBottom,
                data: baseData,
                mode: SectionMode.Edit,
                handlers: baseHandlers,
            };

            render(renderProgramSection(params));

            const props = mockCapturedProps.DualImagesBottom;
            expect(props.images).toEqual(baseData.images);
            expect(typeof props.onImagesChange).toBe('function');

            const file = { url: 'file', mimeType: 'image/jpeg' } as any;
            props.onImagesChange(2, file);

            expect(baseHandlers.onImagesChange).toHaveBeenCalledWith(2, file);
        });
    });

    describe('Card-based templates', () => {
        const cardData = {
            cards: [
                { title: 'T1', description: 'D1' },
                { title: 'T2', description: 'D2' },
                { title: 'T3', description: 'D3' },
                { title: 'T4', description: 'D4' },
            ],
        };

        const cardHandlers = {
            onCardTitleChange: jest.fn(),
            onCardDescriptionChange: jest.fn(),
        };

        const cardTemplates = [
            { id: SectionTemplate.DualTitleDescriptionPairs, cardsCount: 2 },
            { id: SectionTemplate.TripleTitleDescriptionPairs, cardsCount: 3 },
            { id: SectionTemplate.QuadTitleDescriptionPairs, cardsCount: 4 },
        ];

        cardTemplates.forEach(({ id, cardsCount }) => {
            it(`renders TitleDescriptionCardsWrapper for ${id} with ${cardsCount} cards`, () => {
                render(
                    renderProgramSection({
                        templateId: id,
                        data: cardData,
                        mode: SectionMode.Edit,
                        handlers: cardHandlers as any,
                    }),
                );

                expect(screen.getByTestId('TitleDescriptionCardsWrapper')).toHaveAttribute(
                    'data-cards-count',
                    String(cardsCount),
                );
            });

            it(`uses empty cards array for ${id} when data.cards is undefined`, () => {
                render(
                    renderProgramSection({
                        templateId: id,
                        data: { cards: undefined },
                        mode: SectionMode.Edit,
                        handlers: cardHandlers as any,
                    }),
                );

                expect(mockCapturedProps.TitleDescriptionCardsWrapper.cards).toEqual([]);
            });

            it(`passes handlers to ${id} wrapper`, () => {
                render(
                    renderProgramSection({
                        templateId: id,
                        data: cardData,
                        mode: SectionMode.Edit,
                        handlers: cardHandlers as any,
                    }),
                );

                const props = mockCapturedProps.TitleDescriptionCardsWrapper;
                expect(props.onTitleChange).toBe(cardHandlers.onCardTitleChange);
                expect(props.onDescriptionChange).toBe(cardHandlers.onCardDescriptionChange);
            });
        });
    });

    describe('SingleTitleDescriptionAuthorPairs', () => {
        const handlers = {
            onTitleChange: jest.fn(),
            onCardDescriptionChange: jest.fn(),
            onCardAuthorChange: jest.fn(),
            onAddPair: jest.fn(),
            onDeletePair: jest.fn(),
            canAddPair: true,
        };

        it('renders SingleTitleDescriptionAuthorPairs component', () => {
            render(
                renderProgramSection({
                    templateId: SectionTemplate.SingleTitleDescriptionAuthorPairs,
                    data: { title: 'T', descriptionAuthorPairs: [{ description: 'D', author: 'A' }] },
                    mode: SectionMode.Edit,
                    handlers: handlers as any,
                }),
            );

            expect(screen.getByTestId('SingleTitleDescriptionAuthorPairs')).toBeInTheDocument();
        });

        it('maps props and handlers for SingleTitleDescriptionAuthorPairs', () => {
            render(
                renderProgramSection({
                    templateId: SectionTemplate.SingleTitleDescriptionAuthorPairs,
                    data: { title: 'T', descriptionAuthorPairs: [{ description: 'D', author: 'A' }] },
                    mode: SectionMode.Edit,
                    handlers: handlers as any,
                }),
            );

            const props = mockCapturedProps.SingleTitleDescriptionAuthorPairs;

            expect(props.title).toBe('T');
            expect(props.pairs).toEqual([{ description: 'D', author: 'A' }]);
            expect(props.mode).toBe(SectionMode.Edit);

            expect(props.onTitleChange).toBe(handlers.onTitleChange);
            expect(props.onPairDescriptionChange).toBe(handlers.onCardDescriptionChange);
            expect(props.onPairAuthorChange).toBe(handlers.onCardAuthorChange);
            expect(props.onAddPair).toBe(handlers.onAddPair);
            expect(props.onDeletePair).toBe(handlers.onDeletePair);
            expect(props.canAddPair).toBe(true);
        });

        it('uses empty pairs array when descriptionAuthorPairs is undefined', () => {
            render(
                renderProgramSection({
                    templateId: SectionTemplate.SingleTitleDescriptionAuthorPairs,
                    data: { title: 'T' },
                    mode: SectionMode.Edit,
                    handlers: handlers as any,
                }),
            );

            expect(mockCapturedProps.SingleTitleDescriptionAuthorPairs.pairs).toEqual([]);
        });
    });

    describe('SingleTitleQuintupleDescription', () => {
        const handlers = {
            onTitleChange: jest.fn(),
            onDescriptionsChange: jest.fn(),
        };

        it('renders with data.descriptions when provided', () => {
            render(
                renderProgramSection({
                    templateId: SectionTemplate.SingleTitleQuintupleDescription,
                    data: { title: 'T', descriptions: ['a', 'b'] },
                    mode: SectionMode.Edit,
                    handlers: handlers as any,
                }),
            );

            expect(screen.getByTestId('SingleTitleQuintupleDescription')).toBeInTheDocument();

            const props = mockCapturedProps.SingleTitleQuintupleDescription;
            expect(props.descriptions).toEqual(['a', 'b']);
            expect(props.mode).toBe(SectionMode.Edit);
        });

        it('falls back to [data.description] when descriptions are missing', () => {
            render(
                renderProgramSection({
                    templateId: SectionTemplate.SingleTitleQuintupleDescription,
                    data: { title: 'T', description: 'only' },
                    mode: SectionMode.Edit,
                    handlers: handlers as any,
                }),
            );

            expect(mockCapturedProps.SingleTitleQuintupleDescription.descriptions).toEqual(['only']);
        });

        it('uses empty array when descriptions are missing and description is absent', () => {
            render(
                renderProgramSection({
                    templateId: SectionTemplate.SingleTitleQuintupleDescription,
                    data: { title: 'T' },
                    mode: SectionMode.Edit,
                    handlers: handlers as any,
                }),
            );

            expect(mockCapturedProps.SingleTitleQuintupleDescription.descriptions).toEqual([]);
        });

        it('keeps empty descriptions array even if description exists', () => {
            render(
                renderProgramSection({
                    templateId: SectionTemplate.SingleTitleQuintupleDescription,
                    data: { title: 'T', description: 'ignored', descriptions: [] },
                    mode: SectionMode.Edit,
                    handlers: handlers as any,
                }),
            );

            expect(mockCapturedProps.SingleTitleQuintupleDescription.descriptions).toEqual([]);
        });
    });

    it('returns null for unknown template', () => {
        const view = renderProgramSection({
            templateId: 'UNKNOWN' as unknown as SectionTemplate,
            data: baseData,
            mode: SectionMode.Edit,
        });

        expect(view).toBeNull();
    });

    it('passes mode to standard templates', () => {
        render(
            renderProgramSection({
                templateId: SectionTemplate.TextOnly,
                data: baseData,
                mode: SectionMode.Template,
            }),
        );

        expect(screen.getByTestId('TextOnly')).toBeInTheDocument();
        expect(mockCapturedProps.TextOnly.mode).toBe(SectionMode.Template);
    });

    it('defaults mode to View when omitted', () => {
        render(
            renderProgramSection({
                templateId: SectionTemplate.TextOnly,
                data: baseData,
            }),
        );

        expect(mockCapturedProps.TextOnly.mode).toBe(SectionMode.View);
    });
});

describe('getInitialSectionContents', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns base contents for TextOnly', () => {
        const contents = getInitialSectionContents(SectionTemplate.TextOnly);

        expect(contents).toHaveLength(2);
        expect(contents[0].contentType).toBe(ContentType.Title);
        expect(contents[1].contentType).toBe(ContentType.Description);
        expect(contents[0].order).toBe(0);
        expect(contents[1].order).toBe(1);
    });

    it('returns 3 contents for SingleTitleDescriptionAuthorPairs (title + description + author with groupIndex 0)', () => {
        const contents = getInitialSectionContents(SectionTemplate.SingleTitleDescriptionAuthorPairs);

        expect(contents).toHaveLength(3);
        expect(contents[0].contentType).toBe(ContentType.Title);

        expect(contents[1].contentType).toBe(ContentType.Description);
        expect((contents[1] as any).groupIndex).toBe(0);

        expect(contents[2].contentType).toBe(ContentType.Author);
        expect((contents[2] as any).groupIndex).toBe(0);

        expect(contents.map((c) => c.order)).toEqual([0, 1, 2]);
    });

    it('returns 6 contents for SingleTitleQuintupleDescription (1 title + 5 descriptions)', () => {
        const contents = getInitialSectionContents(SectionTemplate.SingleTitleQuintupleDescription);

        expect(contents).toHaveLength(6);
        expect(contents[0].contentType).toBe(ContentType.Title);

        const descriptions = contents.slice(1);
        expect(descriptions).toHaveLength(5);
        expect(descriptions.every((c) => c.contentType === ContentType.Description)).toBe(true);

        expect(contents.map((c) => c.order)).toEqual([0, 1, 2, 3, 4, 5]);
    });

    const singleImageTemplates = [
        SectionTemplate.SingleImageTop,
        SectionTemplate.SingleImageBottom,
        SectionTemplate.SingleImageRight,
    ];

    singleImageTemplates.forEach((templateId) => {
        it(`returns 3 contents for ${templateId}`, () => {
            const contents = getInitialSectionContents(templateId);

            expect(contents).toHaveLength(3);
            expect(contents[0].contentType).toBe(ContentType.Title);
            expect(contents[1].contentType).toBe(ContentType.Description);
            expect(contents[2].contentType).toBe(ContentType.Image);
        });
    });

    it('returns 4 contents for DualImagesBottom', () => {
        const contents = getInitialSectionContents(SectionTemplate.DualImagesBottom);

        expect(contents).toHaveLength(4);
        expect(contents.filter((c) => c.contentType === ContentType.Image)).toHaveLength(2);
    });

    it('returns 5 contents for TripleImagesBottom', () => {
        const contents = getInitialSectionContents(SectionTemplate.TripleImagesBottom);

        expect(contents).toHaveLength(5);
        expect(contents.filter((c) => c.contentType === ContentType.Image)).toHaveLength(3);
    });

    it('returns 6 contents for QuadImagesBottom', () => {
        const contents = getInitialSectionContents(SectionTemplate.QuadImagesBottom);

        expect(contents).toHaveLength(6);
        expect(contents.filter((c) => c.contentType === ContentType.Image)).toHaveLength(4);
    });

    const titleDescriptionPairsTestCases = [
        {
            template: SectionTemplate.DualTitleDescriptionPairs,
            name: 'DualTitleDescriptionPairs',
            pairCount: 2,
            totalContents: 4,
        },
        {
            template: SectionTemplate.TripleTitleDescriptionPairs,
            name: 'TripleTitleDescriptionPairs',
            pairCount: 3,
            totalContents: 6,
        },
        {
            template: SectionTemplate.QuadTitleDescriptionPairs,
            name: 'QuadTitleDescriptionPairs',
            pairCount: 4,
            totalContents: 8,
        },
    ];

    test.each(titleDescriptionPairsTestCases)(
        'returns $totalContents contents for $name ($pairCount title + $pairCount description)',
        ({ template, pairCount, totalContents }) => {
            const contents = getInitialSectionContents(template);

            expect(contents).toHaveLength(totalContents);
            expect(contents.filter((c) => c.contentType === ContentType.Title)).toHaveLength(pairCount);
            expect(contents.filter((c) => c.contentType === ContentType.Description)).toHaveLength(pairCount);

            // Verify groupIndex for each pair
            for (let i = 0; i < pairCount; i++) {
                const titleIndex = i * 2;
                const descIndex = i * 2 + 1;

                expect(contents[titleIndex].contentType).toBe(ContentType.Title);
                expect((contents[titleIndex] as any).groupIndex).toBe(i);

                expect(contents[descIndex].contentType).toBe(ContentType.Description);
                expect((contents[descIndex] as any).groupIndex).toBe(i);
            }
        },
    );

    test.each(titleDescriptionPairsTestCases)('maintains correct order for $name', ({ template, totalContents }) => {
        const contents = getInitialSectionContents(template);
        const expectedOrder = Array.from({ length: totalContents }, (_, i) => i);
        expect(contents.map((c) => c.order)).toEqual(expectedOrder);
    });

    it('returns default base contents for unknown template', () => {
        const contents = getInitialSectionContents('UNKNOWN' as unknown as SectionTemplate);

        expect(contents).toHaveLength(2);
        expect(contents[0].contentType).toBe(ContentType.Title);
        expect(contents[1].contentType).toBe(ContentType.Description);
    });
});
