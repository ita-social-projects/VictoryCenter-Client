import React from 'react';
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

    const templates = [
        { id: ProgramSectionTemplate.QuadImagesBottom, testId: 'QuadImagesBottom' },
        { id: ProgramSectionTemplate.TripleImagesBottom, testId: 'TripleImagesBottom' },
        { id: ProgramSectionTemplate.DualImagesBottom, testId: 'DualImagesBottom' },
        { id: ProgramSectionTemplate.TextOnly, testId: 'TextOnly' },
        { id: ProgramSectionTemplate.SingleImageTop, testId: 'SingleImageTop' },
        { id: ProgramSectionTemplate.SingleImageBottom, testId: 'SingleImageBottom' },
        { id: ProgramSectionTemplate.SingleImageRight, testId: 'SingleImageRight' },
    ];

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

    it('should return null for unknown template', () => {
        const params: RenderProgramSectionParams = {
            templateId: 999 as ProgramSectionTemplate,
            data: baseData,
        };
        expect(renderProgramSection(params)).toBeNull();
    });

    it('should handle onImageChange callback for single image templates', () => {
        const mockOnImagesChange = jest.fn();
        const mockHandlers = {
            onTitleChange: jest.fn(),
            onDescriptionChange: jest.fn(),
            onImagesChange: mockOnImagesChange,
        };

        [
            ProgramSectionTemplate.SingleImageBottom,
            ProgramSectionTemplate.SingleImageTop,
            ProgramSectionTemplate.SingleImageRight,
        ].forEach((templateId) => {
            mockOnImagesChange.mockClear();

            const params: RenderProgramSectionParams = {
                templateId,
                data: baseData,
                handlers: mockHandlers,
            };

            render(renderProgramSection(params));
            expect(mockOnImagesChange).not.toHaveBeenCalled();
        });
    });
});

describe('getInitialSectionContents', () => {
    it('should return base contents for TextOnly template', () => {
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

    it('should return base contents + 1 image for single image templates', () => {
        [
            ProgramSectionTemplate.SingleImageTop,
            ProgramSectionTemplate.SingleImageBottom,
            ProgramSectionTemplate.SingleImageRight,
        ].forEach((template) => {
            const result = getInitialSectionContents(template);

            expect(result).toHaveLength(3);
            expect(result[2]).toEqual({
                contentType: ContentType.Image,
                order: 2,
                title: null,
                description: null,
                image: null,
            });
        });
    });

    it('should return base contents + 2 images for DualImagesBottom template', () => {
        const result = getInitialSectionContents(ProgramSectionTemplate.DualImagesBottom);

        expect(result).toHaveLength(4);
        expect(result[2].contentType).toBe(ContentType.Image);
        expect(result[2].order).toBe(2);
        expect(result[3].contentType).toBe(ContentType.Image);
        expect(result[3].order).toBe(3);
    });

    it('should return base contents + 3 images for TripleImagesBottom template', () => {
        const result = getInitialSectionContents(ProgramSectionTemplate.TripleImagesBottom);

        expect(result).toHaveLength(5);
        expect(result.slice(2).every((item) => item.contentType === ContentType.Image)).toBe(true);
        expect(result[4].order).toBe(4);
    });

    it('should return base contents + 4 images for QuadImagesBottom template', () => {
        const result = getInitialSectionContents(ProgramSectionTemplate.QuadImagesBottom);

        expect(result).toHaveLength(6);
        expect(result.slice(2).every((item) => item.contentType === ContentType.Image)).toBe(true);
        expect(result[5].order).toBe(5);
    });

    it('should return base contents for unknown template', () => {
        const result = getInitialSectionContents(999 as ProgramSectionTemplate);

        expect(result).toHaveLength(2);
        expect(result[0].contentType).toBe(ContentType.Title);
        expect(result[1].contentType).toBe(ContentType.Description);
    });
});
