import React from 'react';
import { render, screen } from '@testing-library/react';
import { SingleSelectInputGroup } from './SingleSelectInputGroup';

jest.mock('@/components/admin/input-label/InputLabel', () => ({
    InputLabel: ({ text }: { text: string }) => <div data-testid="mock-label">{text}</div>,
}));

jest.mock('@/components/common/single-select-input/SingleSelectInput', () => ({
    SingleSelectInput: () => <select title="mock-input" data-testid="mock-select" />,
}));

jest.mock('@/components/admin/input-error/InputError', () => ({
    InputError: () => <div data-testid="mock-error">Error</div>,
}));

describe('SingleSelectInputGroup', () => {
    const mockOptions = [
        { id: '1', name: 'Option 1' },
        { id: '2', name: 'Option 2' },
    ];

    it('renders label, select input and error', () => {
        render(
            <SingleSelectInputGroup
                id="test"
                label="Test Label"
                options={mockOptions}
                getOptionId={(option) => option.id}
                getOptionName={(option) => option.name}
                placeholder="Select option"
                onChange={() => {}}
            />,
        );

        expect(screen.getByTestId('mock-label')).toBeInTheDocument();
        expect(screen.getByTestId('mock-select')).toBeInTheDocument();
        expect(screen.getByTestId('mock-error')).toBeInTheDocument();
    });
});
