import React from 'react';
import { render, screen } from '@testing-library/react';
import { MultiSelectInputGroup } from './MultiSelectInputGroup';

jest.mock('@/components/admin/input-label/InputLabel', () => ({
    InputLabel: ({ text }: { text: string }) => <div data-testid="mock-label">{text}</div>,
}));

jest.mock('@/components/admin/multi-select-input/MultiSelectInput', () => ({
    MultiSelectInput: () => <input data-testid="mock-input" />,
}));

jest.mock('@/components/admin/input-error/InputError', () => ({
    InputError: () => <div data-testid="mock-error">Error</div>,
}));

describe('MultiSelectInputGroup', () => {
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
});
