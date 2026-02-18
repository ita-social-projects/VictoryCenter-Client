import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { renderProgramSection, RenderProgramSectionParams, getInitialSectionContents } from './renderProgramSection';
import { ProgramSectionTemplate, ProgramSectionMode } from '@/types/common/program-sections';
import { ContentType } from '@/types/common/programs';

const mockCapturedProps: Record<string, any> = {};

const mockCapture = (key: string, props: any) => {
    mockCapturedProps[key] = props;
};

jest.mock('@/components/common/program-section-templates/quad-images-bottom/QuadImagesBottom', () => ({
    QuadImagesBottom: (props: any) => {
        mockCapture('QuadImagesBottom', props);
        return <div data-testid="QuadImagesBottom" />;
    },
}));

jest.mock('@/components/common/program-section-templates/triple-images-bottom/TripleImagesBottom', () => ({
    TripleImagesBottom: (props: any) => {
        mockCapture('TripleImagesBottom', props);
        return <div data-testid="TripleImagesBottom" />;
    },
}));

jest.mock('@/components/common/program-section-templates/dual-images-bottom/DualImagesBottom', () => ({
    DualImagesBottom: (props: any) => {
        mockCapture('DualImagesBottom', props);
        return <div data-testid="DualImagesBottom" />;
    },
}));

jest.mock('@/components/common/program-section-templates/text-only/TextOnly', () => ({
    TextOnly: (props: any) => {
        mockCapture('TextOnly', props);
        return <div data-testid="TextOnly" />;
    },
}));

jest.mock('@/components/common/program-section-templates/single-image-top/SingleImageTop', () => ({
    SingleImageTop: (props: any) => {
        mockCapture('SingleImageTop', props);
        return <div data-testid="SingleImageTop" />;
    },
}));

jest.mock('@/components/common/program-section-templates/single-image-bottom/SingleImageBottom', () => ({
    SingleImageBottom: (props: any) => {
        mockCapture('SingleImageBottom', props);
        return <div data-testid="SingleImageBottom" />;
    },
}));

jest.mock('@/components/common/program-section-templates/single-image-right/SingleImageRight', () => ({
    SingleImageRight: (props: any) => {
        mockCapture('SingleImageRight', props);
        return <div data-testid="SingleImageRight" />;
    },
}));

jest.mock('@/components/common/program-section-templates/title-description-cards/TitleDescriptionCardsWrapper', () => ({
    TitleDescriptionCardsWrapper: (props: any) => {
        mockCapture('TitleDescriptionCardsWrapper', props);
        return <div data-testid="TitleDescriptionCardsWrapper" data-cards-count={String(props.cardsCount)} />;
    },
}));

jest.mock(
    '@/components/common/program-section-templates/single-title-quintuple-description/SingleTitleQuintupleDescription',
    () => ({
        SingleTitleQuintupleDescription: (props: any) => {
            mockCapture('SingleTitleQuintupleDescription', props);
            return <div data-testid="SingleTitleQuintupleDescription" />;
        },
    }),
);

jest.mock(
    '@/components/common/program-section-templates/single-title-description-author-pairs/SingleTitleDescriptionAuthorPairs',
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
        { id: ProgramSectionTemplate.QuadImagesBottom, testId: 'QuadImagesBottom' },
        { id: ProgramSectionTemplate.TripleImagesBottom, testId: 'TripleImagesBottom' },
        { id: ProgramSectionTemplate.DualImagesBottom, testId: 'DualImagesBottom' },
        { id: ProgramSectionTemplate.TextOnly, testId: 'TextOnly' },
        { id: ProgramSectionTemplate.SingleImageTop, testId: 'SingleImageTop' },
        { id: ProgramSectionTemplate.SingleImageBottom, testId: 'SingleImageBottom' },
        { id: ProgramSectionTemplate.SingleImageRight, testId: 'SingleImageRight' },
    ];

    describe('Image-based templates', () => {
        imageTemplates.forEach(({ id, testId }) => {
            it(`renders correct component for ${id}`, () => {
                const params: RenderProgramSectionParams = {
                    templateId: id,
                    data: baseData,
                    mode: ProgramSectionMode.Edit,
                    handlers: baseHandlers,
                };

                render(renderProgramSection(params));
                expect(screen.getByTestId(testId)).toBeInTheDocument();
            });
        });

        it('maps single-image template to image prop and wraps onImagesChange into onImageChange', () => {
            const params: RenderProgramSectionParams = {
                templateId: ProgramSectionTemplate.SingleImageTop,
                data: baseData,
                mode: ProgramSectionMode.Edit,
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
                    templateId: ProgramSectionTemplate.SingleImageTop,
                    data: baseData,
                    mode: ProgramSectionMode.Edit,
                    handlers: handlers as any,
                }),
            );

            expect(mockCapturedProps.SingleImageTop.onImageChange).toBeUndefined();
        });

        it('passes images and onImagesChange to multi-image template', () => {
            const params: RenderProgramSectionParams = {
                templateId: ProgramSectionTemplate.DualImagesBottom,
                data: baseData,
                mode: ProgramSectionMode.Edit,
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
            { id: ProgramSectionTemplate.DualTitleDescriptionPairs, cardsCount: 2 },
            { id: ProgramSectionTemplate.TripleTitleDescriptionPairs, cardsCount: 3 },
            { id: ProgramSectionTemplate.QuadTitleDescriptionPairs, cardsCount: 4 },
        ];

        cardTemplates.forEach(({ id, cardsCount }) => {
            it(`renders TitleDescriptionCardsWrapper for ${id} with ${cardsCount} cards`, () => {
                render(
                    renderProgramSection({
                        templateId: id,
                        data: cardData,
                        mode: ProgramSectionMode.Edit,
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
                        mode: ProgramSectionMode.Edit,
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
                        mode: ProgramSectionMode.Edit,
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
                    templateId: ProgramSectionTemplate.SingleTitleDescriptionAuthorPairs,
                    data: { title: 'T', descriptionAuthorPairs: [{ description: 'D', author: 'A' }] },
                    mode: ProgramSectionMode.Edit,
                    handlers: handlers as any,
                }),
            );

            expect(screen.getByTestId('SingleTitleDescriptionAuthorPairs')).toBeInTheDocument();
        });

        it('maps props and handlers for SingleTitleDescriptionAuthorPairs', () => {
            render(
                renderProgramSection({
                    templateId: ProgramSectionTemplate.SingleTitleDescriptionAuthorPairs,
                    data: { title: 'T', descriptionAuthorPairs: [{ description: 'D', author: 'A' }] },
                    mode: ProgramSectionMode.Edit,
                    handlers: handlers as any,
                }),
            );

            const props = mockCapturedProps.SingleTitleDescriptionAuthorPairs;

            expect(props.title).toBe('T');
            expect(props.pairs).toEqual([{ description: 'D', author: 'A' }]);
            expect(props.mode).toBe(ProgramSectionMode.Edit);

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
                    templateId: ProgramSectionTemplate.SingleTitleDescriptionAuthorPairs,
                    data: { title: 'T' },
                    mode: ProgramSectionMode.Edit,
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
                    templateId: ProgramSectionTemplate.SingleTitleQuintupleDescription,
                    data: { title: 'T', descriptions: ['a', 'b'] },
                    mode: ProgramSectionMode.Edit,
                    handlers: handlers as any,
                }),
            );

            expect(screen.getByTestId('SingleTitleQuintupleDescription')).toBeInTheDocument();

            const props = mockCapturedProps.SingleTitleQuintupleDescription;
            expect(props.descriptions).toEqual(['a', 'b']);
            expect(props.mode).toBe(ProgramSectionMode.Edit);
        });

        it('falls back to [data.description] when descriptions are missing', () => {
            render(
                renderProgramSection({
                    templateId: ProgramSectionTemplate.SingleTitleQuintupleDescription,
                    data: { title: 'T', description: 'only' },
                    mode: ProgramSectionMode.Edit,
                    handlers: handlers as any,
                }),
            );

            expect(mockCapturedProps.SingleTitleQuintupleDescription.descriptions).toEqual(['only']);
        });

        it('uses empty array when descriptions are missing and description is absent', () => {
            render(
                renderProgramSection({
                    templateId: ProgramSectionTemplate.SingleTitleQuintupleDescription,
                    data: { title: 'T' },
                    mode: ProgramSectionMode.Edit,
                    handlers: handlers as any,
                }),
            );

            expect(mockCapturedProps.SingleTitleQuintupleDescription.descriptions).toEqual([]);
        });

        it('keeps empty descriptions array even if description exists', () => {
            render(
                renderProgramSection({
                    templateId: ProgramSectionTemplate.SingleTitleQuintupleDescription,
                    data: { title: 'T', description: 'ignored', descriptions: [] },
                    mode: ProgramSectionMode.Edit,
                    handlers: handlers as any,
                }),
            );

            expect(mockCapturedProps.SingleTitleQuintupleDescription.descriptions).toEqual([]);
        });
    });

    it('returns null for unknown template', () => {
        const view = renderProgramSection({
            templateId: 'UNKNOWN' as unknown as ProgramSectionTemplate,
            data: baseData,
            mode: ProgramSectionMode.Edit,
        });

        expect(view).toBeNull();
    });

    it('passes mode to standard templates', () => {
        render(
            renderProgramSection({
                templateId: ProgramSectionTemplate.TextOnly,
                data: baseData,
                mode: ProgramSectionMode.Template,
            }),
        );

        expect(screen.getByTestId('TextOnly')).toBeInTheDocument();
        expect(mockCapturedProps.TextOnly.mode).toBe(ProgramSectionMode.Template);
    });

    it('defaults mode to Published when omitted', () => {
        render(
            renderProgramSection({
                templateId: ProgramSectionTemplate.TextOnly,
                data: baseData,
            }),
        );

        expect(mockCapturedProps.TextOnly.mode).toBe(ProgramSectionMode.View);
    });
});

describe('getInitialSectionContents', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns base contents for TextOnly', () => {
        const contents = getInitialSectionContents(ProgramSectionTemplate.TextOnly);

        expect(contents).toHaveLength(2);
        expect(contents[0].contentType).toBe(ContentType.Title);
        expect(contents[1].contentType).toBe(ContentType.Description);
        expect(contents[0].order).toBe(0);
        expect(contents[1].order).toBe(1);
    });

    it('returns 3 contents for SingleTitleDescriptionAuthorPairs (title + description + author with groupIndex 0)', () => {
        const contents = getInitialSectionContents(ProgramSectionTemplate.SingleTitleDescriptionAuthorPairs);

        expect(contents).toHaveLength(3);
        expect(contents[0].contentType).toBe(ContentType.Title);

        expect(contents[1].contentType).toBe(ContentType.Description);
        expect((contents[1] as any).groupIndex).toBe(0);

        expect(contents[2].contentType).toBe(ContentType.Author);
        expect((contents[2] as any).groupIndex).toBe(0);

        expect(contents.map((c) => c.order)).toEqual([0, 1, 2]);
    });

    it('returns 6 contents for SingleTitleQuintupleDescription (1 title + 5 descriptions)', () => {
        const contents = getInitialSectionContents(ProgramSectionTemplate.SingleTitleQuintupleDescription);

        expect(contents).toHaveLength(6);
        expect(contents[0].contentType).toBe(ContentType.Title);

        const descriptions = contents.slice(1);
        expect(descriptions).toHaveLength(5);
        expect(descriptions.every((c) => c.contentType === ContentType.Description)).toBe(true);

        expect(contents.map((c) => c.order)).toEqual([0, 1, 2, 3, 4, 5]);
    });

    const singleImageTemplates = [
        ProgramSectionTemplate.SingleImageTop,
        ProgramSectionTemplate.SingleImageBottom,
        ProgramSectionTemplate.SingleImageRight,
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
        const contents = getInitialSectionContents(ProgramSectionTemplate.DualImagesBottom);

        expect(contents).toHaveLength(4);
        expect(contents.filter((c) => c.contentType === ContentType.Image)).toHaveLength(2);
    });

    it('returns 5 contents for TripleImagesBottom', () => {
        const contents = getInitialSectionContents(ProgramSectionTemplate.TripleImagesBottom);

        expect(contents).toHaveLength(5);
        expect(contents.filter((c) => c.contentType === ContentType.Image)).toHaveLength(3);
    });

    it('returns 6 contents for QuadImagesBottom', () => {
        const contents = getInitialSectionContents(ProgramSectionTemplate.QuadImagesBottom);

        expect(contents).toHaveLength(6);
        expect(contents.filter((c) => c.contentType === ContentType.Image)).toHaveLength(4);
    });

    it('returns 4 contents for DualTitleDescriptionPairs (2 title + 2 description)', () => {
        const contents = getInitialSectionContents(ProgramSectionTemplate.DualTitleDescriptionPairs);

        expect(contents).toHaveLength(4);
        expect(contents.filter((c) => c.contentType === ContentType.Title)).toHaveLength(2);
        expect(contents.filter((c) => c.contentType === ContentType.Description)).toHaveLength(2);

        // Verify groupIndex for card pairs
        expect(contents[0].contentType).toBe(ContentType.Title);
        expect((contents[0] as any).groupIndex).toBe(0);
        expect(contents[1].contentType).toBe(ContentType.Description);
        expect((contents[1] as any).groupIndex).toBe(0);

        expect(contents[2].contentType).toBe(ContentType.Title);
        expect((contents[2] as any).groupIndex).toBe(1);
        expect(contents[3].contentType).toBe(ContentType.Description);
        expect((contents[3] as any).groupIndex).toBe(1);
    });

    it('returns 6 contents for TripleTitleDescriptionPairs (3 title + 3 description)', () => {
        const contents = getInitialSectionContents(ProgramSectionTemplate.TripleTitleDescriptionPairs);

        expect(contents).toHaveLength(6);
        expect(contents.filter((c) => c.contentType === ContentType.Title)).toHaveLength(3);
        expect(contents.filter((c) => c.contentType === ContentType.Description)).toHaveLength(3);

        // Verify groupIndex for card pairs
        expect(contents[0].contentType).toBe(ContentType.Title);
        expect((contents[0] as any).groupIndex).toBe(0);
        expect(contents[1].contentType).toBe(ContentType.Description);
        expect((contents[1] as any).groupIndex).toBe(0);

        expect(contents[2].contentType).toBe(ContentType.Title);
        expect((contents[2] as any).groupIndex).toBe(1);
        expect(contents[3].contentType).toBe(ContentType.Description);
        expect((contents[3] as any).groupIndex).toBe(1);

        expect(contents[4].contentType).toBe(ContentType.Title);
        expect((contents[4] as any).groupIndex).toBe(2);
        expect(contents[5].contentType).toBe(ContentType.Description);
        expect((contents[5] as any).groupIndex).toBe(2);
    });

    it('returns 8 contents for QuadTitleDescriptionPairs (4 title + 4 description)', () => {
        const contents = getInitialSectionContents(ProgramSectionTemplate.QuadTitleDescriptionPairs);

        expect(contents).toHaveLength(8);
        expect(contents.filter((c) => c.contentType === ContentType.Title)).toHaveLength(4);
        expect(contents.filter((c) => c.contentType === ContentType.Description)).toHaveLength(4);

        // Verify groupIndex for card pairs
        expect(contents[0].contentType).toBe(ContentType.Title);
        expect((contents[0] as any).groupIndex).toBe(0);
        expect(contents[1].contentType).toBe(ContentType.Description);
        expect((contents[1] as any).groupIndex).toBe(0);

        expect(contents[2].contentType).toBe(ContentType.Title);
        expect((contents[2] as any).groupIndex).toBe(1);
        expect(contents[3].contentType).toBe(ContentType.Description);
        expect((contents[3] as any).groupIndex).toBe(1);

        expect(contents[4].contentType).toBe(ContentType.Title);
        expect((contents[4] as any).groupIndex).toBe(2);
        expect(contents[5].contentType).toBe(ContentType.Description);
        expect((contents[5] as any).groupIndex).toBe(2);

        expect(contents[6].contentType).toBe(ContentType.Title);
        expect((contents[6] as any).groupIndex).toBe(3);
        expect(contents[7].contentType).toBe(ContentType.Description);
        expect((contents[7] as any).groupIndex).toBe(3);
    });

    it('maintains correct order for DualTitleDescriptionPairs', () => {
        const contents = getInitialSectionContents(ProgramSectionTemplate.DualTitleDescriptionPairs);

        expect(contents.map((c) => c.order)).toEqual([0, 1, 2, 3]);
    });

    it('returns default base contents for unknown template', () => {
        const contents = getInitialSectionContents('UNKNOWN' as unknown as ProgramSectionTemplate);

        expect(contents).toHaveLength(2);
        expect(contents[0].contentType).toBe(ContentType.Title);
        expect(contents[1].contentType).toBe(ContentType.Description);
    });
});
