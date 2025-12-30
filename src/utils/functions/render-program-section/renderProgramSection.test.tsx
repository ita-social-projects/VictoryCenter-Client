import React from 'react';
import { render, screen } from '@testing-library/react';
import { renderProgramSection, RenderProgramSectionParams } from './renderProgramSection';
import { ProgramSectionTemplate } from '@/types/common/program-sections';

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
        image1: 'img1',
        image2: 'img2',
        image3: 'img3',
        image4: 'img4',
    };
    const baseHandlers = {
        onTitleChange: jest.fn(),
        onDescriptionChange: jest.fn(),
        onImage1Change: jest.fn(),
        onImage2Change: jest.fn(),
        onImage3Change: jest.fn(),
        onImage4Change: jest.fn(),
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
});
