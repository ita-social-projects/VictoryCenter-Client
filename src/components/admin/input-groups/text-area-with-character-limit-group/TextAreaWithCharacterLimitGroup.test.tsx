import React from 'react';
import { render, screen } from '@testing-library/react';
import { TextAreaWithCharacterLimitGroup } from './TextAreaWithCharacterLimitGroup';

jest.mock('@/components/admin/input-label/InputLabel', () => ({
    InputLabel: ({ text }: { text: string }) => <div data-testid="mock-label">{text}</div>,
}));

jest.mock('@/components/admin/textarea-with-character-limit/TextAreaWithCharacterLimit', () => ({
    TextAreaWithCharacterLimit: () => <textarea title="mock-input" data-testid="mock-input" />,
}));

jest.mock('@/components/admin/input-error-with-character-counter/InputErrorWithCharacterCounter', () => ({
    InputErrorWithCharacterCounter: () => <div data-testid="mock-error-counter">Error Counter</div>,
}));

describe('TextAreaWithCharacterLimitGroup', () => {
    it('renders label, input and error counter', () => {
        render(
            <TextAreaWithCharacterLimitGroup
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
        expect(screen.getByTestId('mock-error-counter')).toBeInTheDocument();
    });
});
