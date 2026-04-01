import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CustomFormGroup } from './CompanyProfileFormGroup';

const mockInputWithCharacterLimit = jest.fn((props: any) => (
    <input data-testid="char-limit-input" id={props.id} disabled={props.disabled} />
));

jest.mock('@/components/admin/input-with-character-limit/InputWithCharacterLimit', () => ({
    __esModule: true,
    InputWithCharacterLimit: (props: any) => mockInputWithCharacterLimit(props),
}));

jest.mock('@/components/admin/input-error-with-character-counter/InputErrorWithCharacterCounter', () => ({
    __esModule: true,
    InputErrorWithCharacterCounter: ({ error, maxLength, value, containerClassName }: any) => (
        <div data-testid="input-error-with-counter" data-container-class={containerClassName ?? ''}>
            <div data-testid="input-error">{error ?? ''}</div>
            {!String(containerClassName ?? '').includes('meta-row--error-only') && (
                <div data-testid="input-counter">
                    {String(value ?? '').length}/{maxLength}
                </div>
            )}
        </div>
    ),
}));

jest.mock('@/components/admin/button-tooltip/ButtonTooltip', () => ({
    __esModule: true,
    ButtonTooltip: ({ children }: any) => <div data-testid="button-tooltip">{children}</div>,
}));

describe('CustomFormGroup', () => {
    beforeEach(() => {
        mockInputWithCharacterLimit.mockClear();
    });

    it('renders label and required asterisk when isRequired=true', () => {
        render(
            <CustomFormGroup
                id="field1"
                name="field1"
                maxLength={10}
                labelText="Label"
                isRequired={true}
                value=""
                onChange={() => {}}
            />,
        );

        expect(screen.getByText('Label')).toBeInTheDocument();
        expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('does not render label when hideLabel=true', () => {
        render(
            <CustomFormGroup
                id="field1"
                name="field1"
                maxLength={10}
                labelText="Label"
                hideLabel={true}
                isRequired={true}
                value=""
                onChange={() => {}}
            />,
        );

        expect(screen.queryByText('Label')).not.toBeInTheDocument();
    });

    it('renders tooltip when tooltipText is provided in view mode (disabled=true)', () => {
        render(
            <CustomFormGroup
                id="field1"
                name="field1"
                maxLength={10}
                labelText="Label"
                tooltipText="Tooltip text"
                disabled={true}
                value=""
                onChange={() => {}}
            />,
        );

        expect(screen.getByTestId('button-tooltip')).toHaveTextContent('Tooltip text');
    });

    it('renders tooltip when tooltipText is provided in edit mode (disabled=false)', () => {
        render(
            <CustomFormGroup
                id="field1"
                name="field1"
                maxLength={10}
                labelText="Label"
                tooltipText="Tooltip text"
                disabled={false}
                value=""
                onChange={() => {}}
            />,
        );

        expect(screen.getByTestId('button-tooltip')).toHaveTextContent('Tooltip text');
    });

    it('does not render tooltip when tooltipText is not provided', () => {
        render(
            <CustomFormGroup id="field1" name="field1" maxLength={10} labelText="Label" value="" onChange={() => {}} />,
        );

        expect(screen.queryByTestId('button-tooltip')).not.toBeInTheDocument();
    });

    it('passes hasError=true to InputWithCharacterLimit when error is provided and renders error text via InputErrorWithCharacterCounter', () => {
        render(
            <CustomFormGroup
                id="field1"
                name="field1"
                maxLength={10}
                labelText="Label"
                value=""
                onChange={() => {}}
                error="Some error"
            />,
        );

        expect(mockInputWithCharacterLimit).toHaveBeenCalled();
        const lastCallProps = mockInputWithCharacterLimit.mock.calls.at(-1)?.[0];

        expect(lastCallProps).toEqual(expect.objectContaining({ hasError: true }));
        expect(screen.getByTestId('input-error')).toHaveTextContent('Some error');
    });

    it('passes hasError=false to InputWithCharacterLimit when no error is provided', () => {
        render(
            <CustomFormGroup id="field1" name="field1" maxLength={10} labelText="Label" value="" onChange={() => {}} />,
        );

        expect(mockInputWithCharacterLimit).toHaveBeenCalled();
        const lastCallProps = mockInputWithCharacterLimit.mock.calls.at(-1)?.[0];

        expect(lastCallProps).toEqual(expect.objectContaining({ hasError: false }));
    });

    it('disables internal counter in InputWithCharacterLimit and uses InputErrorWithCharacterCounter for bottom counter', () => {
        render(
            <CustomFormGroup
                id="field1"
                name="field1"
                maxLength={10}
                labelText="Label"
                value="abc"
                onChange={() => {}}
            />,
        );

        expect(mockInputWithCharacterLimit).toHaveBeenCalled();
        const lastCallProps = mockInputWithCharacterLimit.mock.calls.at(-1)?.[0];

        expect(lastCallProps).toEqual(expect.objectContaining({ showCounter: false }));

        expect(screen.getByTestId('input-error-with-counter')).toBeInTheDocument();
        expect(screen.getByTestId('input-counter')).toHaveTextContent('3/10');
    });

    it('when showCounter=false, still renders error row but hides counter', () => {
        render(
            <CustomFormGroup
                id="field1"
                name="field1"
                maxLength={10}
                labelText="Label"
                value="abc"
                onChange={() => {}}
                showCounter={false}
            />,
        );

        expect(screen.getByTestId('input-error-with-counter')).toBeInTheDocument();
        expect(screen.queryByTestId('input-counter')).not.toBeInTheDocument();
    });
});
