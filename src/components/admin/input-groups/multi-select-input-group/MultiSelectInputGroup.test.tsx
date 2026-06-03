import React from 'react';
import { render, screen } from '@testing-library/react';
import { MultiSelectInputGroup } from './MultiSelectInputGroup';
import { MultiSelectInputProps } from '@/components/admin/multi-select-input/MultiSelectInput';

jest.mock('@/components/admin/input-label/InputLabel', () => ({
    InputLabel: ({ text }: { text: string }) => <div data-testid="mock-label">{text}</div>,
}));

const mockMultiSelectInput = jest.fn();

jest.mock('@/components/admin/multi-select-input/MultiSelectInput', () => ({
    MultiSelectInput: (props: MultiSelectInputProps<string>) => {
        mockMultiSelectInput(props);

        return <input title="mock-input" data-testid="mock-input" />;
    },
}));

jest.mock('@/components/admin/input-error/InputError', () => ({
    InputError: () => <div data-testid="mock-error">Error</div>,
}));

describe('MultiSelectInputGroup', () => {
    beforeEach(() => {
        mockMultiSelectInput.mockClear();
    });

    it('renders label, input and error', () => {
        render(
            <MultiSelectInputGroup<string>
                id={'test'}
                label="Test Label"
                options={[]}
                value={undefined}
                getOptionId={(option) => option}
                getOptionName={(option) => option}
            />,
        );

        expect(screen.getByTestId('mock-label')).toBeInTheDocument();
        expect(screen.getByTestId('mock-input')).toBeInTheDocument();
        expect(screen.getByTestId('mock-error')).toBeInTheDocument();
    });

    it('passes display and selection callbacks to input', () => {
        const getDisplayValue = jest.fn((selectedValues: string[]) => selectedValues.join(', '));
        const isOptionSelected = jest.fn((option: string, selectedValues: string[]) => selectedValues.includes(option));

        render(
            <MultiSelectInputGroup<string>
                id={'test'}
                label="Test Label"
                options={['One', 'Two']}
                value={['One']}
                getOptionId={(option) => option}
                getOptionName={(option) => option}
                getDisplayValue={getDisplayValue}
                isOptionSelected={isOptionSelected}
            />,
        );

        expect(mockMultiSelectInput).toHaveBeenCalledWith(
            expect.objectContaining({
                getDisplayValue,
                isOptionSelected,
            }),
        );
    });
});
