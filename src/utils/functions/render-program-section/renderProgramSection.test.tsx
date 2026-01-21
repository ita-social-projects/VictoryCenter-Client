import { render, screen } from '@testing-library/react';
import { renderProgramSection, RenderProgramSectionParams, getInitialSectionContents } from './renderProgramSection';
import { ProgramSectionTemplate } from '@/types/common/program-sections';
import { ContentType } from '@/types/common/programs';

jest.mock('@/components/common/program-section-templates/quad-images-bottom/QuadImagesBottom', () => ({
    QuadImagesBottom: (props: any) => <div data-testid="QuadImagesBottom" {...props} />,
}));
jest.mock('@/components/common/program-section-templates/triple-images-bottom/TripleImagesBottom', () => ({
    TripleImagesBottom: (props: any) => <div data-testid="TripleImagesBottom" {...props} />,
}));
jest.mock('@/components/common/program-section-templates/dual-images-bottom/DualImagesBottom', () => ({
    DualImagesBottom: (props: any) => <div data-testid="DualImagesBottom" {...props} />,
}));
jest.mock('@/components/common/program-section-templates/text-only/TextOnly', () => ({
    TextOnly: (props: any) => <div data-testid="TextOnly" {...props} />,
}));
jest.mock('@/components/common/program-section-templates/single-image-top/SingleImageTop', () => ({
    SingleImageTop: (props: any) => <div data-testid="SingleImageTop" {...props} />,
}));
jest.mock('@/components/common/program-section-templates/single-image-bottom/SingleImageBottom', () => ({
    SingleImageBottom: (props: any) => <div data-testid="SingleImageBottom" {...props} />,
}));
jest.mock('@/components/common/program-section-templates/single-image-right/SingleImageRight', () => ({
    SingleImageRight: (props: any) => <div data-testid="SingleImageRight" {...props} />,
}));
jest.mock('@/components/common/program-section-templates/title-description-cards/TitleDescriptionCardsWrapper', () => ({
    TitleDescriptionCardsWrapper: (props: any) => (
        <div data-testid="TitleDescriptionCardsWrapper" data-cards-count={props.cardsCount} />
    ),
}));

describe('renderProgramSection', () => {
    const baseData = {
        title: 'Title',
        description: 'Desc',
        images: ['img1', 'img2', 'img3', 'img4'],
    };
    const baseHandlers = {
        onTitleChange: jest.fn(),
        onDescriptionChange: jest.fn(),
        onImagesChange: jest.fn(),
    };

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
                    isEditable: true,
                    handlers: baseHandlers,
                };
                render(renderProgramSection(params));
                expect(screen.getByTestId(testId)).toBeInTheDocument();
            });
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
            { id: ProgramSectionTemplate.DualTitleDescription, cardsCount: 2 },
            { id: ProgramSectionTemplate.TripleTitleDescription, cardsCount: 3 },
            { id: ProgramSectionTemplate.QuadTitleDescription, cardsCount: 4 },
        ];

        cardTemplates.forEach(({ id, cardsCount }) => {
            it(`renders TitleDescriptionCardsWrapper for ${id} with ${cardsCount} cards`, () => {
                render(
                    renderProgramSection({
                        templateId: id,
                        data: cardData,
                        isEditable: true,
                        handlers: cardHandlers,
                    }),
                );

                const wrapper = screen.getByTestId('TitleDescriptionCardsWrapper');
                expect(wrapper).toBeInTheDocument();
                expect(wrapper).toHaveAttribute('data-cards-count', cardsCount.toString());
            });

            it(`passes empty cards array for ${id} when data.cards is undefined`, () => {
                render(
                    renderProgramSection({
                        templateId: id,
                        data: { cards: undefined },
                        isEditable: true,
                        handlers: cardHandlers,
                    }),
                );

                expect(screen.getByTestId('TitleDescriptionCardsWrapper')).toBeInTheDocument();
            });

            it(`passes isEditable=false for ${id}`, () => {
                render(
                    renderProgramSection({
                        templateId: id,
                        data: cardData,
                        isEditable: false,
                        handlers: cardHandlers,
                    }),
                );

                expect(screen.getByTestId('TitleDescriptionCardsWrapper')).toBeInTheDocument();
            });

            it(`passes handlers to ${id}`, () => {
                render(
                    renderProgramSection({
                        templateId: id,
                        data: cardData,
                        isEditable: true,
                        handlers: cardHandlers,
                    }),
                );

                expect(screen.getByTestId('TitleDescriptionCardsWrapper')).toBeInTheDocument();
            });
        });
    });

    it('returns null for unknown template', () => {
        const utils = renderProgramSection({
            templateId: 'UNKNOWN' as unknown as ProgramSectionTemplate,
            data: baseData,
            isEditable: true,
        });

        expect(utils).toBeNull();
    });

    it('passes isTemplate prop to components', () => {
        render(
            renderProgramSection({
                templateId: ProgramSectionTemplate.TextOnly,
                data: baseData,
                isTemplate: true,
                isEditable: false,
            }),
        );

        expect(screen.getByTestId('TextOnly')).toBeInTheDocument();
    });
});

describe('getInitialSectionContents', () => {
    describe('Base templates', () => {
        it('returns base contents for TextOnly', () => {
            const contents = getInitialSectionContents(ProgramSectionTemplate.TextOnly);

            expect(contents).toHaveLength(2);
            expect(contents[0].contentType).toBe(ContentType.Title);
            expect(contents[1].contentType).toBe(ContentType.Description);
        });
    });

    describe('Single image templates', () => {
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
    });

    describe('Multiple images templates', () => {
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
    });

    describe('Card-based templates', () => {
        it('returns 4 contents for DualTitleDescription (2 title + 2 description)', () => {
            const contents = getInitialSectionContents(ProgramSectionTemplate.DualTitleDescription);

            expect(contents).toHaveLength(4);
            expect(contents.filter((c) => c.contentType === ContentType.Title)).toHaveLength(2);
            expect(contents.filter((c) => c.contentType === ContentType.Description)).toHaveLength(2);
        });

        it('returns 6 contents for TripleTitleDescription (3 title + 3 description)', () => {
            const contents = getInitialSectionContents(ProgramSectionTemplate.TripleTitleDescription);

            expect(contents).toHaveLength(6);
            expect(contents.filter((c) => c.contentType === ContentType.Title)).toHaveLength(3);
            expect(contents.filter((c) => c.contentType === ContentType.Description)).toHaveLength(3);
        });

        it('returns 8 contents for QuadTitleDescription (4 title + 4 description)', () => {
            const contents = getInitialSectionContents(ProgramSectionTemplate.QuadTitleDescription);

            expect(contents).toHaveLength(8);
            expect(contents.filter((c) => c.contentType === ContentType.Title)).toHaveLength(4);
            expect(contents.filter((c) => c.contentType === ContentType.Description)).toHaveLength(4);
        });

        it('maintains correct order for DualTitleDescription', () => {
            const contents = getInitialSectionContents(ProgramSectionTemplate.DualTitleDescription);

            expect(contents[0].order).toBe(0);
            expect(contents[1].order).toBe(1);
            expect(contents[2].order).toBe(2);
            expect(contents[3].order).toBe(3);
        });
    });

    it('returns default contents for unknown template', () => {
        const contents = getInitialSectionContents('UNKNOWN' as unknown as ProgramSectionTemplate);

        expect(contents).toHaveLength(2);
        expect(contents[0].contentType).toBe(ContentType.Title);
        expect(contents[1].contentType).toBe(ContentType.Description);
    });
});
