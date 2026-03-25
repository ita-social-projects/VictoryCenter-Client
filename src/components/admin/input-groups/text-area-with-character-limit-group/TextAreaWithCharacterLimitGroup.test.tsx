import React from 'react';
import { render, screen } from '@testing-library/react';
import { TextAreaWithCharacterLimitGroup } from './TextAreaWithCharacterLimitGroup';
import { InputLabelProps } from '@/components/admin/input-label/InputLabel';
import { TextAreaWithCharacterLimitProps } from '@/components/admin/textarea-with-character-limit/TextAreaWithCharacterLimit';

jest.mock('@/components/admin/input-label/InputLabel', () => ({
    InputLabel: ({ text }: InputLabelProps) => <div data-testid="mock-label">{text}</div>,
}));

jest.mock('@/components/admin/textarea-with-character-limit/TextAreaWithCharacterLimit', () => ({
    TextAreaWithCharacterLimit: (props: TextAreaWithCharacterLimitProps) => (
        <textarea
            title="mock-input"
            data-testid="mock-input"
            data-autogrow={props.autoGrow}
            data-maxrows={props.maxRows}
        />
    ),
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

    it('passes autoGrow and maxRows props to TextAreaWithCharacterLimit', () => {
        render(
            <TextAreaWithCharacterLimitGroup
                name={'test'}
                id={'test'}
                label="Test Label"
                value=""
                onChange={() => {}}
                maxLength={100}
                autoGrow={true}
                maxRows={8}
            />,
        );

        const textarea = screen.getByTestId('mock-input');
        expect(textarea).toHaveAttribute('data-autogrow', 'true');
        expect(textarea).toHaveAttribute('data-maxrows', '8');
    });
});
