import React from 'react';
import { render, screen } from '@testing-library/react';
import { InputWithCharacterLimitGroup } from './InputWithCharacterLimitGroup';

jest.mock('../../input-label/InputLabel', () => ({
    InputLabel: ({ text }: { text: string }) => <div data-testid="mock-label">{text}</div>,
}));

jest.mock('../../input-with-character-limit/InputWithCharacterLimit', () => ({
    InputWithCharacterLimit: () => <input data-testid="mock-input" />,
}));

jest.mock('../../input-error/InputError', () => ({
    InputError: () => <div data-testid="mock-error">Error</div>,
}));

describe('InputWithCharacterLimitGroup', () => {
    it('renders label, input and error', () => {
        render(
            <InputWithCharacterLimitGroup
                name={'test'}
                id={'test'}
                label="Test Label"
                value=""
                onChange={() => {}}
                maxLength={10}
            />,
        );

        expect(screen.getByTestId('mock-label')).toBeInTheDocument();
        expect(screen.getByTestId('mock-input')).toBeInTheDocument();
        expect(screen.getByTestId('mock-error')).toBeInTheDocument();
    });
});
