import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
    clearCapturedSectionTemplateProps,
    mockCapturedSectionTemplateProps,
} from '@/utils/functions/test-helpers/section-template-component-mocks';
import {
    renderHistorySection,
    getInitialHistorySectionContents,
    isHistoryTemplate,
    HISTORY_SUPPORTED_TEMPLATES,
} from './renderHistorySection';
import { SectionTemplate, SectionMode } from '@/types/common/sections';
import { ContentType } from '@/types/common/section-contents';

describe('renderHistorySection', () => {
    const baseData = {
        title: 'History title',
        description: 'History description',
        images: [
            { id: 1, url: 'img-1', mimeType: 'image/jpeg' },
            { id: 2, url: 'img-2', mimeType: 'image/jpeg' },
        ],
    };

    const baseHandlers = {
        onTitleChange: jest.fn(),
        onDescriptionChange: jest.fn(),
        onImagesChange: jest.fn(),
    };

    beforeEach(() => {
        clearCapturedSectionTemplateProps();
        jest.clearAllMocks();
    });

    it('returns null for unsupported template', () => {
        const view = renderHistorySection({
            templateId: SectionTemplate.DualTitleDescriptionPairs,
            data: baseData,
        });

        expect(view).toBeNull();
    });

    it('renders a standard template and passes base props', () => {
        render(
            renderHistorySection({
                templateId: SectionTemplate.TextOnly,
                data: baseData,
                validationResetKey: 7,
                handlers: baseHandlers,
            }) as React.ReactElement,
        );

        expect(screen.getByTestId('TextOnly')).toBeInTheDocument();
        expect(mockCapturedSectionTemplateProps.TextOnly.title).toBe('History title');
        expect(mockCapturedSectionTemplateProps.TextOnly.description).toBe('History description');
        expect(mockCapturedSectionTemplateProps.TextOnly.mode).toBe(SectionMode.View);
        expect(mockCapturedSectionTemplateProps.TextOnly.validationResetKey).toBe(7);
        expect(mockCapturedSectionTemplateProps.TextOnly.onTitleChange).toBe(baseHandlers.onTitleChange);
        expect(mockCapturedSectionTemplateProps.TextOnly.onDescriptionChange).toBe(baseHandlers.onDescriptionChange);
    });

    it('maps onImagesChange into onImageChange for single-image templates', () => {
        render(
            renderHistorySection({
                templateId: SectionTemplate.SingleImageTop,
                data: baseData,
                mode: SectionMode.Edit,
                handlers: baseHandlers,
            }) as React.ReactElement,
        );

        const props = mockCapturedSectionTemplateProps.SingleImageTop;

        expect(props.image).toEqual(baseData.images[0]);
        expect(props.mode).toBe(SectionMode.Edit);
        expect(typeof props.onImageChange).toBe('function');

        const file = { url: 'new-image', mimeType: 'image/jpeg' } as any;
        props.onImageChange(file);

        expect(baseHandlers.onImagesChange).toHaveBeenCalledWith(0, file);
    });

    it('does not pass onImageChange when image handler is missing', () => {
        render(
            renderHistorySection({
                templateId: SectionTemplate.SingleImageBottom,
                data: baseData,
                handlers: {
                    onTitleChange: baseHandlers.onTitleChange,
                    onDescriptionChange: baseHandlers.onDescriptionChange,
                },
            }) as React.ReactElement,
        );

        expect(mockCapturedSectionTemplateProps.SingleImageBottom.onImageChange).toBeUndefined();
    });

    it('passes images and onImagesChange for multi-image templates', () => {
        render(
            renderHistorySection({
                templateId: SectionTemplate.QuadImagesBottom,
                data: baseData,
                mode: SectionMode.Edit,
                handlers: baseHandlers,
            }) as React.ReactElement,
        );

        const props = mockCapturedSectionTemplateProps.QuadImagesBottom;
        expect(props.images).toEqual(baseData.images);
        expect(props.mode).toBe(SectionMode.Edit);
        expect(props.onImagesChange).toBe(baseHandlers.onImagesChange);
    });
});

describe('getInitialHistorySectionContents', () => {
    it('returns empty list for unsupported templates', () => {
        const contents = getInitialHistorySectionContents(SectionTemplate.SingleTitleQuestionAnswerPairs);

        expect(contents).toEqual([]);
    });

    const templateCases = [
        { templateId: SectionTemplate.TextOnly, imageCount: 0 },
        { templateId: SectionTemplate.SingleImageTop, imageCount: 1 },
        { templateId: SectionTemplate.SingleImageBottom, imageCount: 1 },
        { templateId: SectionTemplate.SingleImageRight, imageCount: 1 },
        { templateId: SectionTemplate.DualImagesBottom, imageCount: 2 },
        { templateId: SectionTemplate.TripleImagesBottom, imageCount: 3 },
        { templateId: SectionTemplate.QuadImagesBottom, imageCount: 4 },
    ];

    templateCases.forEach(({ templateId, imageCount }) => {
        it(`creates title, description and ${imageCount} image contents for template ${templateId}`, () => {
            const contents = getInitialHistorySectionContents(templateId);

            expect(contents).toHaveLength(2 + imageCount);
            expect(contents[0]).toMatchObject({ contentType: ContentType.Title, order: 0, title: '' });
            expect(contents[1]).toMatchObject({ contentType: ContentType.Description, order: 1, description: '' });

            const imageContents = contents.slice(2);
            expect(imageContents).toHaveLength(imageCount);
            imageContents.forEach((content, index) => {
                expect(content).toMatchObject({ contentType: ContentType.Image, order: 2 + index, image: null });
            });
        });
    });
});

describe('isHistoryTemplate', () => {
    it('returns true for all supported history templates', () => {
        HISTORY_SUPPORTED_TEMPLATES.forEach((templateId) => {
            expect(isHistoryTemplate(templateId)).toBe(true);
        });
    });

    it('returns false for program-only templates', () => {
        expect(isHistoryTemplate(SectionTemplate.DualTitleDescriptionPairs)).toBe(false);
        expect(isHistoryTemplate(SectionTemplate.SingleTitleQuestionAnswerPairs)).toBe(false);
    });
});
