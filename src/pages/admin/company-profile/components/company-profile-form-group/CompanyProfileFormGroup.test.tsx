import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CustomFormGroup } from './CompanyProfileFormGroup';

const mockInputWithCharacterLimit = jest.fn();
jest.mock('@/components/admin/input-with-character-limit/InputWithCharacterLimit', () => ({
    InputWithCharacterLimit: (props: any) => {
        mockInputWithCharacterLimit(props);
        return <input data-testid="char-limit-input" id={props.id} disabled={props.disabled} />;
    },
}));

jest.mock('@/components/admin/input-error/InputError', () => ({
    InputError: ({ error }: any) => (error ? <div data-testid="input-error">{error}</div> : null),
}));

jest.mock('@/components/admin/button-tooltip/ButtonTooltip', () => ({
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

    it('renders tooltip when tooltipText is provided', () => {
        render(
            <CustomFormGroup
                id="field1"
                name="field1"
                maxLength={10}
                labelText="Label"
                tooltipText="Tooltip text"
                value=""
                onChange={() => {}}
            />,
        );

        expect(screen.getByTestId('button-tooltip')).toHaveTextContent('Tooltip text');
    });

    it('does not render tooltip content when tooltipText is not provided', () => {
        render(
            <CustomFormGroup id="field1" name="field1" maxLength={10} labelText="Label" value="" onChange={() => {}} />,
        );
        expect(screen.queryByTestId('button-tooltip')).not.toBeInTheDocument();
    });

    it('passes hasError=true to InputWithCharacterLimit when error is provided and renders InputError', () => {
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

        expect(mockInputWithCharacterLimit).toHaveBeenCalledWith(expect.objectContaining({ hasError: true }));
        expect(screen.getByTestId('input-error')).toHaveTextContent('Some error');
    });

    it('passes hasError=false to InputWithCharacterLimit when no error is provided', () => {
        render(
            <CustomFormGroup id="field1" name="field1" maxLength={10} labelText="Label" value="" onChange={() => {}} />,
        );

        expect(mockInputWithCharacterLimit).toHaveBeenCalledWith(expect.objectContaining({ hasError: false }));
    });
});
