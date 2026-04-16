import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ReactElement } from 'react';
import { ImageValues } from '@/types/common/image';
import { SectionMode, SectionTemplate } from '@/types/common/sections';
import {
    clearCapturedSectionTemplateProps,
    mockCapturedSectionTemplateProps,
} from '@/utils/functions/test-helpers/section-template-component-mocks';
import {
    renderStandardSectionTemplate,
    StandardTemplateComponentMap,
    StandardTemplateComponentProps,
} from './renderStandardSectionTemplate';

describe('renderStandardSectionTemplate', () => {
    const baseData = {
        title: 'Section title',
        description: 'Section description',
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

    const renderTemplate = (params: Parameters<typeof renderStandardSectionTemplate>[0]) => {
        const view = renderStandardSectionTemplate(params);
        expect(view).not.toBeNull();
        render(view as ReactElement);
    };

    beforeEach(() => {
        clearCapturedSectionTemplateProps();
        jest.clearAllMocks();
    });

    it('returns null when template is not in map', () => {
        const view = renderStandardSectionTemplate({
            templateId: SectionTemplate.DualTitleDescriptionPairs,
            data: baseData,
        });

        expect(view).toBeNull();
    });

    it('passes base props to standard template component', () => {
        renderTemplate({
            templateId: SectionTemplate.TextOnly,
            data: baseData,
            mode: SectionMode.Edit,
            handlers: baseHandlers,
            validationResetKey: 12,
        });

        expect(screen.getByTestId('TextOnly')).toBeInTheDocument();

        const props = mockCapturedSectionTemplateProps.TextOnly;
        expect(props.title).toBe(baseData.title);
        expect(props.description).toBe(baseData.description);
        expect(props.mode).toBe(SectionMode.Edit);
        expect(props.validationResetKey).toBe(12);
        expect(props.onTitleChange).toBe(baseHandlers.onTitleChange);
        expect(props.onDescriptionChange).toBe(baseHandlers.onDescriptionChange);
    });

    it('defaults mode to view when not provided', () => {
        renderTemplate({
            templateId: SectionTemplate.TextOnly,
            data: baseData,
        });

        expect(mockCapturedSectionTemplateProps.TextOnly.mode).toBe(SectionMode.View);
    });

    it('maps first image and wraps onImageChange for single-image templates', () => {
        renderTemplate({
            templateId: SectionTemplate.SingleImageTop,
            data: baseData,
            mode: SectionMode.Edit,
            handlers: baseHandlers,
        });

        const props = mockCapturedSectionTemplateProps.SingleImageTop;
        expect(props.image).toEqual(baseData.images[0]);
        expect(typeof props.onImageChange).toBe('function');

        const file: ImageValues = {
            base64: 'new-base64',
            mimeType: 'image/png',
        };

        props.onImageChange(file);

        expect(baseHandlers.onImagesChange).toHaveBeenCalledWith(0, file);
    });

    it('does not pass onImageChange when image handler is absent', () => {
        renderTemplate({
            templateId: SectionTemplate.SingleImageBottom,
            data: baseData,
            handlers: {
                onTitleChange: baseHandlers.onTitleChange,
                onDescriptionChange: baseHandlers.onDescriptionChange,
            },
        });

        expect(mockCapturedSectionTemplateProps.SingleImageBottom.onImageChange).toBeUndefined();
    });

    it('passes images and onImagesChange for multi-image templates', () => {
        renderTemplate({
            templateId: SectionTemplate.DualImagesBottom,
            data: baseData,
            mode: SectionMode.Edit,
            handlers: baseHandlers,
        });

        const props = mockCapturedSectionTemplateProps.DualImagesBottom;
        expect(props.images).toEqual(baseData.images);
        expect(props.onImagesChange).toBe(baseHandlers.onImagesChange);
    });

    it('uses provided templatesMap override', () => {
        let capturedProps: StandardTemplateComponentProps | null = null;

        const CustomTextTemplate = (props: StandardTemplateComponentProps) => {
            capturedProps = props;
            return <div data-testid="CustomTextTemplate" />;
        };

        const templatesMap: StandardTemplateComponentMap = {
            [SectionTemplate.TextOnly]: CustomTextTemplate,
        };

        renderTemplate({
            templateId: SectionTemplate.TextOnly,
            data: baseData,
            templatesMap,
        });

        expect(screen.getByTestId('CustomTextTemplate')).toBeInTheDocument();
        expect(capturedProps).not.toBeNull();

        if (!capturedProps) {
            throw new Error('Custom template props were not captured');
        }

        expect(capturedProps).toEqual(expect.objectContaining({ mode: SectionMode.View }));
    });
});
