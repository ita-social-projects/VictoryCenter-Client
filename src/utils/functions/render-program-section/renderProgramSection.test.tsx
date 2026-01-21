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
                isEditable: true,
                handlers: baseHandlers,
            };
            render(renderProgramSection(params));
            expect(screen.getByTestId(testId)).toBeInTheDocument();
        });
    });
});

describe('renderProgramSection – TitleDescription templates', () => {
    const baseData = {
        cards: [
            { title: 'T1', description: 'D1' },
            { title: 'T2', description: 'D2' },
            { title: 'T3', description: 'D3' },
            { title: 'T4', description: 'D4' },
        ],
    };

    const baseHandlers = {
        onCardTitleChange: jest.fn(),
        onCardDescriptionChange: jest.fn(),
    };

    const cases = [
        { id: ProgramSectionTemplate.DualTitleDescription, cardsCount: '2' },
        { id: ProgramSectionTemplate.TripleTitleDescription, cardsCount: '3' },
        { id: ProgramSectionTemplate.QuadTitleDescription, cardsCount: '4' },
    ];

    cases.forEach(({ id, cardsCount }) => {
        it(`renders TitleDescriptionCardsWrapper for ${id}`, () => {
            render(
                renderProgramSection({
                    templateId: id,
                    data: baseData,
                    isEditable: true,
                    handlers: baseHandlers,
                }),
            );

            const wrapper = screen.getByTestId('TitleDescriptionCardsWrapper');
            expect(wrapper).toBeInTheDocument();
            expect(wrapper).toHaveAttribute('data-cards-count', cardsCount);
        });
    });
});
