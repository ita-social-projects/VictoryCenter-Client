import React, { createRef } from 'react';
import { render, screen, fireEvent, act, createEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { TranslateMemberForm, TranslateTeamMemberFormRef } from './TranslateMemberForm';

jest.mock('@/validation/admin/team-member-schema/team-member-schema', () => ({
    TEAM_MEMBER_VALIDATION_FUNCTIONS: {
        validateFullName: jest.fn(() => undefined),
        validateDescription: jest.fn(() => undefined),
    },
}));

jest.mock('@/components/common/select/Select', () => {
    const Select = ({ children, onValueChange }: any) => (
        <div data-testid="select">
            {children}
            <button data-testid="select-change-trigger" onClick={() => onValueChange && onValueChange('UA')}>
                Change Lang
            </button>
        </div>
    );

    Select.Option = ({ children }: any) => <div data-testid="select-option">{children}</div>;

    return { Select };
});

jest.mock('@/components/admin/button/Button', () => ({
    Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

jest.mock('../common-member-fields/CommonMemberFields', () => ({
    CommonMemberFields: ({
        formState,
        handleFullNameChange,
        handleDescriptionChange,
        handleFullNameBlur,
        handleDescriptionBlur,
        formDisabled,
    }: any) => (
        <div>
            <input
                data-testid="fullName"
                value={formState.fullName}
                onChange={handleFullNameChange}
                onBlur={handleFullNameBlur}
                disabled={formDisabled}
            />
            <textarea
                data-testid="description"
                value={formState.description}
                onChange={handleDescriptionChange}
                onBlur={handleDescriptionBlur}
                disabled={formDisabled}
            />
        </div>
    ),
}));

const renderForm = (props: any = {}) => {
    const ref = createRef<TranslateTeamMemberFormRef>();
    render(<TranslateMemberForm ref={ref} onSubmit={jest.fn()} {...props} />);
    return { ref };
};

describe('TranslateMemberForm', () => {
    it('renders form and fields', () => {
        renderForm();

        expect(screen.getByTestId('test-form')).toBeInTheDocument();
        expect(screen.getByTestId('fullName')).toBeInTheDocument();
        expect(screen.getByTestId('description')).toBeInTheDocument();
        expect(screen.getByTestId('select')).toBeInTheDocument();
    });

    it('fills fields with initialData', () => {
        renderForm({
            initialData: {
                fullName: 'John Doe',
                description: 'Developer',
            },
        });

        expect(screen.getByTestId('fullName')).toHaveValue('John Doe');
        expect(screen.getByTestId('description')).toHaveValue('Developer');
    });

    it('updates fields on change', () => {
        renderForm();

        fireEvent.change(screen.getByTestId('fullName'), {
            target: { value: 'New Name' },
        });

        fireEvent.change(screen.getByTestId('description'), {
            target: { value: 'New description' },
        });

        expect(screen.getByTestId('fullName')).toHaveValue('New Name');
        expect(screen.getByTestId('description')).toHaveValue('New description');
    });

    it('calls validation on blur', async () => {
        const {
            TEAM_MEMBER_VALIDATION_FUNCTIONS,
        } = require('@/validation/admin/team-member-schema/team-member-schema');

        renderForm();

        fireEvent.blur(screen.getByTestId('fullName'));
        fireEvent.blur(screen.getByTestId('description'));

        expect(TEAM_MEMBER_VALIDATION_FUNCTIONS.validateFullName).toHaveBeenCalled();
        expect(TEAM_MEMBER_VALIDATION_FUNCTIONS.validateDescription).toHaveBeenCalled();
    });

    it('submits form via ref', async () => {
        const onSubmit = jest.fn();
        const { ref } = renderForm({ onSubmit });

        fireEvent.change(screen.getByTestId('fullName'), {
            target: { value: 'John' },
        });

        fireEvent.change(screen.getByTestId('description'), {
            target: { value: 'Developer' },
        });

        await act(async () => {
            await ref.current?.submit();
        });

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith({
            fullName: 'John',
            description: 'Developer',
        });
    });

    it('exposes isValid and isDirty via ref', () => {
        const { ref } = renderForm();

        expect(ref.current?.isValid()).toBe(true);
        expect(ref.current?.isDirty()).toBe(false);
    });

    it('disables fields when formDisabled is true', () => {
        renderForm({ formDisabled: true });

        expect(screen.getByTestId('fullName')).toBeDisabled();
        expect(screen.getByTestId('description')).toBeDisabled();
    });

    it('prevents default behavior on form submit', () => {
        renderForm();
        const form = screen.getByTestId('test-form');

        const event = createEvent.submit(form);

        event.preventDefault = jest.fn();

        fireEvent(form, event);

        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('executes the empty onValueChange handler for Select', () => {
        renderForm();
        const trigger = screen.getByTestId('select-change-trigger');
        expect(() => fireEvent.click(trigger)).not.toThrow();
    });
});
