import React from 'react';
import { render, screen } from '@testing-library/react';
import { InputWithCharacterLimitGroup } from './InputWithCharacterLimitGroup';

const mockInputWithCharacterLimit = jest.fn();

jest.mock('@/components/admin/input-label/InputLabel', () => ({
    InputLabel: ({ text }: { text: string }) => <div data-testid="mock-label">{text}</div>,
}));

jest.mock('@/components/admin/input-with-character-limit/InputWithCharacterLimit', () => ({
    InputWithCharacterLimit: (props: {
        showCounter?: boolean;
        hasError?: boolean;
        onWarningChange?: (warning: string | null) => void;
    }) => {
        mockInputWithCharacterLimit(props);
        return (
            <input
                title="mock-input"
                data-testid="mock-input"
                data-show-counter={String(props.showCounter)}
                data-has-error={String(props.hasError)}
            />
        );
    },
}));

jest.mock('@/components/admin/input-error/InputError', () => ({
    InputError: ({ error }: { error?: string }) => <div data-testid="mock-error">{error ?? ''}</div>,
}));

jest.mock('@/components/admin/input-error-with-character-counter/InputErrorWithCharacterCounter', () => ({
    InputErrorWithCharacterCounter: ({
        error,
        maxLength,
        counterId,
        htmlFor,
        value,
    }: {
        error?: string;
        maxLength: number;
        counterId: string;
        htmlFor: string;
        value: string;
    }) => (
        <div
            data-testid="mock-error-counter"
            data-error={error ?? ''}
            data-max-length={String(maxLength)}
            data-counter-id={counterId}
            data-html-for={htmlFor}
            data-value={value}
        />
    ),
}));

describe('InputWithCharacterLimitGroup', () => {
    beforeEach(() => {
        mockInputWithCharacterLimit.mockClear();
    });

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
        expect(screen.getByTestId('mock-input')).toHaveAttribute('data-show-counter', 'true');
        expect(mockInputWithCharacterLimit).toHaveBeenCalledWith(
            expect.objectContaining({
                hasError: false,
                showCounter: true,
            }),
        );
    });

    it('renders counter below the input when showCounterBelow is enabled', () => {
        render(
            <InputWithCharacterLimitGroup
                name={'test'}
                id={'test'}
                label="Test Label"
                value="value"
                onChange={() => {}}
                maxLength={10}
                error="Error message"
                showCounterBelow={true}
            />,
        );

        expect(screen.getByTestId('mock-input')).toHaveAttribute('data-show-counter', 'false');
        expect(screen.getByTestId('mock-input')).toHaveAttribute('data-has-error', 'true');
        expect(screen.queryByTestId('mock-error')).not.toBeInTheDocument();
        expect(screen.getByTestId('mock-error-counter')).toHaveAttribute('data-error', 'Error message');
        expect(screen.getByTestId('mock-error-counter')).toHaveAttribute('data-max-length', '10');
        expect(screen.getByTestId('mock-error-counter')).toHaveAttribute('data-counter-id', 'test-character-count');
        expect(screen.getByTestId('mock-error-counter')).toHaveAttribute('data-html-for', 'test');
        expect(screen.getByTestId('mock-error-counter')).toHaveAttribute('data-value', 'value');
    });
});
