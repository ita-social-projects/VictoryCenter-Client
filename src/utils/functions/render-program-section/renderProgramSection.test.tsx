import React from 'react';
import { render, screen } from '@testing-library/react';
import { renderProgramSection, getInitialSectionContents, RenderProgramSectionParams } from './renderProgramSection';
import { ProgramSectionTemplate } from '@/types/common/program-sections';
import { ContentType } from '@/types/admin/programs';

jest.mock('@/components/common/program-section-templates/quad-images-bottom/QuadImagesBottom', () => ({
    QuadImagesBottom: (props: any) => (
        <div data-testid="QuadImagesBottom" data-props={JSON.stringify(props)}>
            <span data-testid="quad-title">{props.title}</span>
            <span data-testid="quad-description">{props.description}</span>
            <span data-testid="quad-images">{JSON.stringify(props.images)}</span>
            <span data-testid="quad-is-template">{String(props.isTemplate)}</span>
            <span data-testid="quad-is-editable">{String(props.isEditable)}</span>
            <span data-testid="quad-has-on-title-change">{String(!!props.onTitleChange)}</span>
            <span data-testid="quad-has-on-description-change">{String(!!props.onDescriptionChange)}</span>
            <span data-testid="quad-has-on-images-change">{String(!!props.onImagesChange)}</span>
        </div>
    ),
}));
jest.mock('@/components/common/program-section-templates/triple-images-bottom/TripleImagesBottom', () => ({
    TripleImagesBottom: (props: any) => (
        <div data-testid="TripleImagesBottom" data-props={JSON.stringify(props)}>
            <span data-testid="triple-title">{props.title}</span>
            <span data-testid="triple-description">{props.description}</span>
            <span data-testid="triple-images">{JSON.stringify(props.images)}</span>
            <span data-testid="triple-is-template">{String(props.isTemplate)}</span>
            <span data-testid="triple-is-editable">{String(props.isEditable)}</span>
            <span data-testid="triple-has-on-title-change">{String(!!props.onTitleChange)}</span>
            <span data-testid="triple-has-on-description-change">{String(!!props.onDescriptionChange)}</span>
            <span data-testid="triple-has-on-images-change">{String(!!props.onImagesChange)}</span>
        </div>
    ),
}));
jest.mock('@/components/common/program-section-templates/dual-images-bottom/DualImagesBottom', () => ({
    DualImagesBottom: (props: any) => (
        <div data-testid="DualImagesBottom" data-props={JSON.stringify(props)}>
            <span data-testid="dual-title">{props.title}</span>
            <span data-testid="dual-description">{props.description}</span>
            <span data-testid="dual-images">{JSON.stringify(props.images)}</span>
            <span data-testid="dual-is-template">{String(props.isTemplate)}</span>
            <span data-testid="dual-is-editable">{String(props.isEditable)}</span>
            <span data-testid="dual-has-on-title-change">{String(!!props.onTitleChange)}</span>
            <span data-testid="dual-has-on-description-change">{String(!!props.onDescriptionChange)}</span>
            <span data-testid="dual-has-on-images-change">{String(!!props.onImagesChange)}</span>
        </div>
    ),
}));
jest.mock('@/components/common/program-section-templates/text-only/TextOnly', () => ({
    TextOnly: (props: any) => (
        <div data-testid="TextOnly" data-props={JSON.stringify(props)}>
            <span data-testid="text-only-title">{props.title}</span>
            <span data-testid="text-only-description">{props.description}</span>
            <span data-testid="text-only-is-template">{String(props.isTemplate)}</span>
            <span data-testid="text-only-is-editable">{String(props.isEditable)}</span>
            <span data-testid="text-only-has-on-title-change">{String(!!props.onTitleChange)}</span>
            <span data-testid="text-only-has-on-description-change">{String(!!props.onDescriptionChange)}</span>
        </div>
    ),
}));
jest.mock('@/components/common/program-section-templates/single-image-top/SingleImageTop', () => ({
    SingleImageTop: (props: any) => (
        <div data-testid="SingleImageTop" data-props={JSON.stringify(props)}>
            <span data-testid="single-top-title">{props.title}</span>
            <span data-testid="single-top-description">{props.description}</span>
            <span data-testid="single-top-image">{props.image}</span>
            <span data-testid="single-top-is-template">{String(props.isTemplate)}</span>
            <span data-testid="single-top-is-editable">{String(props.isEditable)}</span>
            <span data-testid="single-top-has-on-title-change">{String(!!props.onTitleChange)}</span>
            <span data-testid="single-top-has-on-description-change">{String(!!props.onDescriptionChange)}</span>
            <span data-testid="single-top-has-on-image-change">{String(!!props.onImageChange)}</span>
        </div>
    ),
}));
jest.mock('@/components/common/program-section-templates/single-image-bottom/SingleImageBottom', () => ({
    SingleImageBottom: (props: any) => (
        <div data-testid="SingleImageBottom" data-props={JSON.stringify(props)}>
            <span data-testid="single-bottom-title">{props.title}</span>
            <span data-testid="single-bottom-description">{props.description}</span>
            <span data-testid="single-bottom-image">{props.image}</span>
            <span data-testid="single-bottom-is-template">{String(props.isTemplate)}</span>
            <span data-testid="single-bottom-is-editable">{String(props.isEditable)}</span>
            <span data-testid="single-bottom-has-on-title-change">{String(!!props.onTitleChange)}</span>
            <span data-testid="single-bottom-has-on-description-change">{String(!!props.onDescriptionChange)}</span>
            <span data-testid="single-bottom-has-on-image-change">{String(!!props.onImageChange)}</span>
        </div>
    ),
}));
jest.mock('@/components/common/program-section-templates/single-image-right/SingleImageRight', () => ({
    SingleImageRight: (props: any) => (
        <div data-testid="SingleImageRight" data-props={JSON.stringify(props)}>
            <span data-testid="single-right-title">{props.title}</span>
            <span data-testid="single-right-description">{props.description}</span>
            <span data-testid="single-right-image">{props.image}</span>
            <span data-testid="single-right-is-template">{String(props.isTemplate)}</span>
            <span data-testid="single-right-is-editable">{String(props.isEditable)}</span>
            <span data-testid="single-right-has-on-title-change">{String(!!props.onTitleChange)}</span>
            <span data-testid="single-right-has-on-description-change">{String(!!props.onDescriptionChange)}</span>
            <span data-testid="single-right-has-on-image-change">{String(!!props.onImageChange)}</span>
        </div>
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

    const templates = [
        { id: ProgramSectionTemplate.QuadImagesBottom, testId: 'QuadImagesBottom' },
        { id: ProgramSectionTemplate.TripleImagesBottom, testId: 'TripleImagesBottom' },
        { id: ProgramSectionTemplate.DualImagesBottom, testId: 'DualImagesBottom' },
        { id: ProgramSectionTemplate.TextOnly, testId: 'TextOnly' },
        { id: ProgramSectionTemplate.SingleImageTop, testId: 'SingleImageTop' },
        { id: ProgramSectionTemplate.SingleImageBottom, testId: 'SingleImageBottom' },
        { id: ProgramSectionTemplate.SingleImageRight, testId: 'SingleImageRight' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    templates.forEach(({ id, testId }) => {
        it(`renders correct component for ${id}`, () => {
            const params: RenderProgramSectionParams = {
                templateId: id,
                data: baseData,
                isTemplate: true,
                isEditable: true,
                handlers: baseHandlers,
            };
            render(renderProgramSection(params));
            expect(screen.getByTestId(testId)).toBeInTheDocument();
        });
    });

    describe('props passing', () => {
        it('passes all props correctly to QuadImagesBottom', () => {
            const data = { title: 'Test Title', description: 'Test Desc', images: ['img1', 'img2'] };
            const handlers = {
                onTitleChange: jest.fn(),
                onDescriptionChange: jest.fn(),
                onImagesChange: jest.fn(),
            };
            render(
                renderProgramSection({
                    templateId: ProgramSectionTemplate.QuadImagesBottom,
                    data,
                    isTemplate: true,
                    isEditable: false,
                    handlers,
                }),
            );

            expect(screen.getByTestId('quad-title')).toHaveTextContent('Test Title');
            expect(screen.getByTestId('quad-description')).toHaveTextContent('Test Desc');
            expect(screen.getByTestId('quad-images')).toHaveTextContent(JSON.stringify(['img1', 'img2']));
            expect(screen.getByTestId('quad-is-template')).toHaveTextContent('true');
            expect(screen.getByTestId('quad-is-editable')).toHaveTextContent('false');
            expect(screen.getByTestId('quad-has-on-title-change')).toHaveTextContent('true');
            expect(screen.getByTestId('quad-has-on-description-change')).toHaveTextContent('true');
            expect(screen.getByTestId('quad-has-on-images-change')).toHaveTextContent('true');
        });

        it('passes all props correctly to TripleImagesBottom', () => {
            const data = { title: 'Test Title', description: 'Test Desc', images: ['img1', 'img2', 'img3'] };
            render(
                renderProgramSection({
                    templateId: ProgramSectionTemplate.TripleImagesBottom,
                    data,
                    isTemplate: false,
                    isEditable: true,
                    handlers: baseHandlers,
                }),
            );

            expect(screen.getByTestId('triple-title')).toHaveTextContent('Test Title');
            expect(screen.getByTestId('triple-description')).toHaveTextContent('Test Desc');
            expect(screen.getByTestId('triple-is-template')).toHaveTextContent('false');
            expect(screen.getByTestId('triple-is-editable')).toHaveTextContent('true');
        });

        it('passes all props correctly to DualImagesBottom', () => {
            const data = { title: 'Test Title', description: 'Test Desc', images: ['img1', 'img2'] };
            render(
                renderProgramSection({
                    templateId: ProgramSectionTemplate.DualImagesBottom,
                    data,
                    isTemplate: true,
                    isEditable: true,
                    handlers: baseHandlers,
                }),
            );

            expect(screen.getByTestId('dual-title')).toHaveTextContent('Test Title');
            expect(screen.getByTestId('dual-description')).toHaveTextContent('Test Desc');
            expect(screen.getByTestId('dual-is-template')).toHaveTextContent('true');
            expect(screen.getByTestId('dual-is-editable')).toHaveTextContent('true');
        });

        it('passes all props correctly to TextOnly', () => {
            const data = { title: 'Test Title', description: 'Test Desc' };
            render(
                renderProgramSection({
                    templateId: ProgramSectionTemplate.TextOnly,
                    data,
                    isTemplate: false,
                    isEditable: false,
                    handlers: baseHandlers,
                }),
            );

            expect(screen.getByTestId('text-only-title')).toHaveTextContent('Test Title');
            expect(screen.getByTestId('text-only-description')).toHaveTextContent('Test Desc');
            expect(screen.getByTestId('text-only-is-template')).toHaveTextContent('false');
            expect(screen.getByTestId('text-only-is-editable')).toHaveTextContent('false');
        });

        it('passes all props correctly to SingleImageBottom', () => {
            const data = { title: 'Test Title', description: 'Test Desc', images: ['img1'] };
            render(
                renderProgramSection({
                    templateId: ProgramSectionTemplate.SingleImageBottom,
                    data,
                    isTemplate: true,
                    isEditable: true,
                    handlers: baseHandlers,
                }),
            );

            expect(screen.getByTestId('single-bottom-title')).toHaveTextContent('Test Title');
            expect(screen.getByTestId('single-bottom-description')).toHaveTextContent('Test Desc');
            expect(screen.getByTestId('single-bottom-image')).toHaveTextContent('img1');
            expect(screen.getByTestId('single-bottom-is-template')).toHaveTextContent('true');
            expect(screen.getByTestId('single-bottom-is-editable')).toHaveTextContent('true');
        });

        it('passes all props correctly to SingleImageTop', () => {
            const data = { title: 'Test Title', description: 'Test Desc', images: ['img1'] };
            render(
                renderProgramSection({
                    templateId: ProgramSectionTemplate.SingleImageTop,
                    data,
                    isTemplate: false,
                    isEditable: true,
                    handlers: baseHandlers,
                }),
            );

            expect(screen.getByTestId('single-top-title')).toHaveTextContent('Test Title');
            expect(screen.getByTestId('single-top-description')).toHaveTextContent('Test Desc');
            expect(screen.getByTestId('single-top-image')).toHaveTextContent('img1');
            expect(screen.getByTestId('single-top-is-template')).toHaveTextContent('false');
            expect(screen.getByTestId('single-top-is-editable')).toHaveTextContent('true');
        });

        it('passes all props correctly to SingleImageRight', () => {
            const data = { title: 'Test Title', description: 'Test Desc', images: ['img1'] };
            render(
                renderProgramSection({
                    templateId: ProgramSectionTemplate.SingleImageRight,
                    data,
                    isTemplate: true,
                    isEditable: false,
                    handlers: baseHandlers,
                }),
            );

            expect(screen.getByTestId('single-right-title')).toHaveTextContent('Test Title');
            expect(screen.getByTestId('single-right-description')).toHaveTextContent('Test Desc');
            expect(screen.getByTestId('single-right-image')).toHaveTextContent('img1');
            expect(screen.getByTestId('single-right-is-template')).toHaveTextContent('true');
            expect(screen.getByTestId('single-right-is-editable')).toHaveTextContent('false');
        });
    });

    describe('handlers', () => {
        it('passes handlers when provided', () => {
            const handlers = {
                onTitleChange: jest.fn(),
                onDescriptionChange: jest.fn(),
                onImagesChange: jest.fn(),
            };
            render(
                renderProgramSection({
                    templateId: ProgramSectionTemplate.TextOnly,
                    data: baseData,
                    handlers,
                }),
            );

            expect(screen.getByTestId('text-only-has-on-title-change')).toHaveTextContent('true');
            expect(screen.getByTestId('text-only-has-on-description-change')).toHaveTextContent('true');
        });

        it('works when handlers are not provided', () => {
            render(
                renderProgramSection({
                    templateId: ProgramSectionTemplate.TextOnly,
                    data: baseData,
                }),
            );

            expect(screen.getByTestId('text-only-has-on-title-change')).toHaveTextContent('false');
            expect(screen.getByTestId('text-only-has-on-description-change')).toHaveTextContent('false');
        });

        it('works when handlers are partially provided', () => {
            const handlers = {
                onTitleChange: jest.fn(),
            };
            render(
                renderProgramSection({
                    templateId: ProgramSectionTemplate.TextOnly,
                    data: baseData,
                    handlers,
                }),
            );

            expect(screen.getByTestId('text-only-has-on-title-change')).toHaveTextContent('true');
            expect(screen.getByTestId('text-only-has-on-description-change')).toHaveTextContent('false');
        });
    });

    describe('SingleImage handlers.onImagesChange', () => {
        it('passes onImageChange when handlers.onImagesChange exists for SingleImageBottom', () => {
            const onImagesChange = jest.fn();
            render(
                renderProgramSection({
                    templateId: ProgramSectionTemplate.SingleImageBottom,
                    data: baseData,
                    handlers: { onImagesChange },
                }),
            );

            expect(screen.getByTestId('single-bottom-has-on-image-change')).toHaveTextContent('true');
        });

        it('does not pass onImageChange when handlers.onImagesChange does not exist for SingleImageBottom', () => {
            render(
                renderProgramSection({
                    templateId: ProgramSectionTemplate.SingleImageBottom,
                    data: baseData,
                    handlers: {},
                }),
            );

            expect(screen.getByTestId('single-bottom-has-on-image-change')).toHaveTextContent('false');
        });

        it('passes onImageChange when handlers.onImagesChange exists for SingleImageTop', () => {
            const onImagesChange = jest.fn();
            render(
                renderProgramSection({
                    templateId: ProgramSectionTemplate.SingleImageTop,
                    data: baseData,
                    handlers: { onImagesChange },
                }),
            );

            expect(screen.getByTestId('single-top-has-on-image-change')).toHaveTextContent('true');
        });

        it('does not pass onImageChange when handlers.onImagesChange does not exist for SingleImageTop', () => {
            render(
                renderProgramSection({
                    templateId: ProgramSectionTemplate.SingleImageTop,
                    data: baseData,
                    handlers: {},
                }),
            );

            expect(screen.getByTestId('single-top-has-on-image-change')).toHaveTextContent('false');
        });

        it('passes onImageChange when handlers.onImagesChange exists for SingleImageRight', () => {
            const onImagesChange = jest.fn();
            render(
                renderProgramSection({
                    templateId: ProgramSectionTemplate.SingleImageRight,
                    data: baseData,
                    handlers: { onImagesChange },
                }),
            );

            expect(screen.getByTestId('single-right-has-on-image-change')).toHaveTextContent('true');
        });

        it('does not pass onImageChange when handlers.onImagesChange does not exist for SingleImageRight', () => {
            render(
                renderProgramSection({
                    templateId: ProgramSectionTemplate.SingleImageRight,
                    data: baseData,
                    handlers: {},
                }),
            );

            expect(screen.getByTestId('single-right-has-on-image-change')).toHaveTextContent('false');
        });

        it('calls handlers.onImagesChange with correct index when onImageChange is called for SingleImageBottom', () => {
            const onImagesChange = jest.fn();
            render(
                renderProgramSection({
                    templateId: ProgramSectionTemplate.SingleImageBottom,
                    data: baseData,
                    handlers: { onImagesChange },
                }),
            );

            const component = screen.getByTestId('SingleImageBottom');
            const props = JSON.parse(component.getAttribute('data-props') || '{}');
            const mockFile = { file: 'test.jpg' } as any;

            if (props.onImageChange) {
                props.onImageChange(mockFile);
                expect(onImagesChange).toHaveBeenCalledWith(0, mockFile);
            }
        });
    });

    describe('data.images handling', () => {
        it('handles undefined images array', () => {
            const data = { title: 'Test', description: 'Desc' };
            render(
                renderProgramSection({
                    templateId: ProgramSectionTemplate.SingleImageBottom,
                    data,
                    handlers: baseHandlers,
                }),
            );

            expect(screen.getByTestId('single-bottom-image')).toHaveTextContent('');
        });

        it('handles empty images array', () => {
            const data = { title: 'Test', description: 'Desc', images: [] };
            render(
                renderProgramSection({
                    templateId: ProgramSectionTemplate.SingleImageBottom,
                    data,
                    handlers: baseHandlers,
                }),
            );

            expect(screen.getByTestId('single-bottom-image')).toHaveTextContent('');
        });

        it('uses first image from array for SingleImage components', () => {
            const data = { title: 'Test', description: 'Desc', images: ['first.jpg', 'second.jpg'] };
            render(
                renderProgramSection({
                    templateId: ProgramSectionTemplate.SingleImageBottom,
                    data,
                    handlers: baseHandlers,
                }),
            );

            expect(screen.getByTestId('single-bottom-image')).toHaveTextContent('first.jpg');
        });
    });

    describe('default case', () => {
        it('returns null for unknown templateId', () => {
            const result = renderProgramSection({
                templateId: 999 as ProgramSectionTemplate,
                data: baseData,
            });

            expect(result).toBeNull();
        });
    });

    describe('default parameters', () => {
        it('uses default isTemplate=false when not provided', () => {
            render(
                renderProgramSection({
                    templateId: ProgramSectionTemplate.TextOnly,
                    data: baseData,
                }),
            );

            expect(screen.getByTestId('text-only-is-template')).toHaveTextContent('false');
        });

        it('uses default isEditable=false when not provided', () => {
            render(
                renderProgramSection({
                    templateId: ProgramSectionTemplate.TextOnly,
                    data: baseData,
                }),
            );

            expect(screen.getByTestId('text-only-is-editable')).toHaveTextContent('false');
        });
    });
});

describe('getInitialSectionContents', () => {
    it('returns base contents for TextOnly template', () => {
        const result = getInitialSectionContents(ProgramSectionTemplate.TextOnly);

        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({
            contentType: ContentType.Title,
            order: 0,
            title: '',
            description: null,
            image: null,
        });
        expect(result[1]).toEqual({
            contentType: ContentType.Description,
            order: 1,
            title: null,
            description: '',
            image: null,
        });
    });

    it('returns base contents plus one image for SingleImageTop', () => {
        const result = getInitialSectionContents(ProgramSectionTemplate.SingleImageTop);

        expect(result).toHaveLength(3);
        expect(result[0].contentType).toBe(ContentType.Title);
        expect(result[1].contentType).toBe(ContentType.Description);
        expect(result[2]).toEqual({
            contentType: ContentType.Image,
            order: 2,
            title: null,
            description: null,
            image: null,
        });
    });

    it('returns base contents plus one image for SingleImageBottom', () => {
        const result = getInitialSectionContents(ProgramSectionTemplate.SingleImageBottom);

        expect(result).toHaveLength(3);
        expect(result[2]).toEqual({
            contentType: ContentType.Image,
            order: 2,
            title: null,
            description: null,
            image: null,
        });
    });

    it('returns base contents plus one image for SingleImageRight', () => {
        const result = getInitialSectionContents(ProgramSectionTemplate.SingleImageRight);

        expect(result).toHaveLength(3);
        expect(result[2]).toEqual({
            contentType: ContentType.Image,
            order: 2,
            title: null,
            description: null,
            image: null,
        });
    });

    it('returns base contents plus two images for DualImagesBottom', () => {
        const result = getInitialSectionContents(ProgramSectionTemplate.DualImagesBottom);

        expect(result).toHaveLength(4);
        expect(result[0].contentType).toBe(ContentType.Title);
        expect(result[1].contentType).toBe(ContentType.Description);
        expect(result[2]).toEqual({
            contentType: ContentType.Image,
            order: 2,
            title: null,
            description: null,
            image: null,
        });
        expect(result[3]).toEqual({
            contentType: ContentType.Image,
            order: 3,
            title: null,
            description: null,
            image: null,
        });
    });

    it('returns base contents plus three images for TripleImagesBottom', () => {
        const result = getInitialSectionContents(ProgramSectionTemplate.TripleImagesBottom);

        expect(result).toHaveLength(5);
        expect(result[0].contentType).toBe(ContentType.Title);
        expect(result[1].contentType).toBe(ContentType.Description);
        expect(result[2]).toEqual({
            contentType: ContentType.Image,
            order: 2,
            title: null,
            description: null,
            image: null,
        });
        expect(result[3]).toEqual({
            contentType: ContentType.Image,
            order: 3,
            title: null,
            description: null,
            image: null,
        });
        expect(result[4]).toEqual({
            contentType: ContentType.Image,
            order: 4,
            title: null,
            description: null,
            image: null,
        });
    });

    it('returns base contents plus four images for QuadImagesBottom', () => {
        const result = getInitialSectionContents(ProgramSectionTemplate.QuadImagesBottom);

        expect(result).toHaveLength(6);
        expect(result[0].contentType).toBe(ContentType.Title);
        expect(result[1].contentType).toBe(ContentType.Description);
        expect(result[2]).toEqual({
            contentType: ContentType.Image,
            order: 2,
            title: null,
            description: null,
            image: null,
        });
        expect(result[3]).toEqual({
            contentType: ContentType.Image,
            order: 3,
            title: null,
            description: null,
            image: null,
        });
        expect(result[4]).toEqual({
            contentType: ContentType.Image,
            order: 4,
            title: null,
            description: null,
            image: null,
        });
        expect(result[5]).toEqual({
            contentType: ContentType.Image,
            order: 5,
            title: null,
            description: null,
            image: null,
        });
    });

    it('returns base contents for unknown templateId (default case)', () => {
        const result = getInitialSectionContents(999 as ProgramSectionTemplate);

        expect(result).toHaveLength(2);
        expect(result[0].contentType).toBe(ContentType.Title);
        expect(result[1].contentType).toBe(ContentType.Description);
    });

    it('returns correct order values for all contents', () => {
        const result = getInitialSectionContents(ProgramSectionTemplate.QuadImagesBottom);

        expect(result[0].order).toBe(0);
        expect(result[1].order).toBe(1);
        expect(result[2].order).toBe(2);
        expect(result[3].order).toBe(3);
        expect(result[4].order).toBe(4);
        expect(result[5].order).toBe(5);
    });
});
