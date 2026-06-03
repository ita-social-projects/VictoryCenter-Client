import React from 'react';

export const mockCapturedSectionTemplateProps: Record<string, any> = {};

export const captureSectionTemplateProps = (key: string, props: any) => {
    mockCapturedSectionTemplateProps[key] = props;
};

export const clearCapturedSectionTemplateProps = () => {
    Object.keys(mockCapturedSectionTemplateProps).forEach((key) => {
        delete mockCapturedSectionTemplateProps[key];
    });
};

const mockCaptureSectionTemplateProps = captureSectionTemplateProps;

jest.mock('@/components/common/section-templates/quad-images-bottom/QuadImagesBottom', () => ({
    QuadImagesBottom: (props: any) => {
        mockCaptureSectionTemplateProps('QuadImagesBottom', props);
        return <div data-testid="QuadImagesBottom" />;
    },
}));

jest.mock('@/components/common/section-templates/triple-images-bottom/TripleImagesBottom', () => ({
    TripleImagesBottom: (props: any) => {
        mockCaptureSectionTemplateProps('TripleImagesBottom', props);
        return <div data-testid="TripleImagesBottom" />;
    },
}));

jest.mock('@/components/common/section-templates/dual-images-bottom/DualImagesBottom', () => ({
    DualImagesBottom: (props: any) => {
        mockCaptureSectionTemplateProps('DualImagesBottom', props);
        return <div data-testid="DualImagesBottom" />;
    },
}));

jest.mock('@/components/common/section-templates/text-only/TextOnly', () => ({
    TextOnly: (props: any) => {
        mockCaptureSectionTemplateProps('TextOnly', props);
        return <div data-testid="TextOnly" />;
    },
}));

jest.mock('@/components/common/section-templates/single-image-top/SingleImageTop', () => ({
    SingleImageTop: (props: any) => {
        mockCaptureSectionTemplateProps('SingleImageTop', props);
        return <div data-testid="SingleImageTop" />;
    },
}));

jest.mock('@/components/common/section-templates/single-image-bottom/SingleImageBottom', () => ({
    SingleImageBottom: (props: any) => {
        mockCaptureSectionTemplateProps('SingleImageBottom', props);
        return <div data-testid="SingleImageBottom" />;
    },
}));

jest.mock('@/components/common/section-templates/single-image-right/SingleImageRight', () => ({
    SingleImageRight: (props: any) => {
        mockCaptureSectionTemplateProps('SingleImageRight', props);
        return <div data-testid="SingleImageRight" />;
    },
}));
