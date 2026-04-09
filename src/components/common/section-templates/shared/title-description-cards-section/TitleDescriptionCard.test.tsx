import React from 'react';
import { render, screen } from '@testing-library/react';
import { TitleDescriptionCard } from './TitleDescriptionCard';
import { ProgramSectionMode, ProgramSectionTemplate } from '@/types/common/program-sections';
import { useCardValidation } from '@/hooks/admin/use-section-card-validation/useCardValidation';

jest.mock('@/hooks/admin/use-section-card-validation/useCardValidation', () => ({
    useCardValidation: jest.fn(),
}));

jest.mock('@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup', () => ({
    InputWithCharacterLimitGroup: ({ showCounterBelow }: { showCounterBelow?: boolean }) => (
        <div data-testid="title-input-group" data-show-counter-below={String(showCounterBelow)} />
    ),
}));

jest.mock('./CardDescriptionField', () => ({
    CardDescriptionField: () => <div data-testid="description-field" />,
}));

jest.mock('@/utils/functions/program-section-template-validation/programSectionTemplateValidation', () => ({
    getProgramSectionTemplateMaxLength: jest.fn((_: ProgramSectionTemplate, type: number) => (type === 0 ? 30 : 120)),
    getProgramSectionTemplateMinLength: jest.fn(() => 1),
}));

const useCardValidationMock = useCardValidation as jest.Mock;

describe('TitleDescriptionCard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useCardValidationMock
            .mockReturnValueOnce({
                error: 'title-error',
                handleChange: jest.fn(),
                handleBlur: jest.fn(),
            })
            .mockReturnValueOnce({
                error: 'description-error',
                handleChange: jest.fn(),
                handleBlur: jest.fn(),
            });
    });

    it('uses bottom counter mode for title input in edit mode', () => {
        render(
            <TitleDescriptionCard
                card={{ title: 'Title', description: 'Description' }}
                index={0}
                template={ProgramSectionTemplate.DualTitleDescriptionPairs}
                mode={ProgramSectionMode.Edit}
            />,
        );

        expect(screen.getByTestId('title-input-group')).toHaveAttribute('data-show-counter-below', 'true');
        expect(screen.getByTestId('description-field')).toBeInTheDocument();
        expect(useCardValidationMock).toHaveBeenCalledTimes(2);
    });
});
