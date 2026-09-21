import React, { createRef } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
    TranslateWhoWeAreTitleAndDescriptionForm,
    TranslateWhoWeAreTitleAndDescriptionFormRef,
} from './TranslateWhoWeAreTitleAndDescriptionForm';
import { getWhoWeAreValidationMock } from '@/utils/test-mocks/who-we-are-form-mocks';
import {
    blurRichTextField,
    changeRichTextField,
    focusRichTextField,
    submitFormByRef,
} from '@/pages/admin/who-we-are/components/modals/forms/shared/form-test-helpers';

jest.mock('@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup', () => ({
    RichTextInputGroup: (props: any) =>
        require('@/utils/test-mocks/who-we-are-form-mocks').MockRichTextInputGroup(props),
}));

jest.mock(
    '@/validation/admin/who-we-are-schema/WhoWeAreSchema',
    () => require('@/utils/test-mocks/who-we-are-form-mocks').mockWhoWeAreSchemaModule,
);

const validationMock = getWhoWeAreValidationMock();

describe('TranslateWhoWeAreTitleAndDescriptionForm', () => {
    const renderForm = (props: Partial<React.ComponentProps<typeof TranslateWhoWeAreTitleAndDescriptionForm>> = {}) => {
        const ref = createRef<TranslateWhoWeAreTitleAndDescriptionFormRef>();
        const defaultProps: React.ComponentProps<typeof TranslateWhoWeAreTitleAndDescriptionForm> = {
            onSubmit: jest.fn(),
            limits: { titleLimit: 200, descriptionLimit: 500 },
        };

        render(<TranslateWhoWeAreTitleAndDescriptionForm ref={ref} {...defaultProps} {...props} />);

        return {
            ref,
            onSubmit: props.onSubmit ?? defaultProps.onSubmit,
        };
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders title and description fields', () => {
        renderForm();

        expect(screen.getByTestId('rich-text-title')).toBeInTheDocument();
        expect(screen.getByTestId('rich-text-description')).toBeInTheDocument();
    });

    it('fills fields from initialData', () => {
        renderForm({
            initialData: {
                title: '<p>Existing title</p>',
                description: '<p>Existing description</p>',
            },
        });

        expect(screen.getByTestId('rich-text-title')).toHaveValue('<p>Existing title</p>');
        expect(screen.getByTestId('rich-text-description')).toHaveValue('<p>Existing description</p>');
    });

    it('updates values and marks form as dirty', async () => {
        const onDirtyChange = jest.fn();
        renderForm({ onDirtyChange });

        changeRichTextField('title', '<p>Updated title</p>');

        await waitFor(() => {
            expect(onDirtyChange).toHaveBeenCalledWith(true);
        });
    });

    it('shows validation errors on blur', () => {
        jest.useFakeTimers();
        validationMock.validateText.mockReturnValue('Required');

        renderForm();

        act(() => {
            jest.runAllTimers();
        });

        focusRichTextField('title');
        blurRichTextField('title');
        focusRichTextField('description');
        blurRichTextField('description');

        expect(screen.getByTestId('error-title')).toHaveTextContent('Required');
        expect(screen.getByTestId('error-description')).toHaveTextContent('Required');

        jest.useRealTimers();
    });

    it('submits form data via ref', async () => {
        const onSubmit = jest.fn();
        const { ref } = renderForm({ onSubmit });

        changeRichTextField('title', '<p>Valid title</p>');
        changeRichTextField('description', '<p>Valid description</p>');

        await submitFormByRef(ref);

        expect(onSubmit).toHaveBeenCalledWith({
            title: '<p>Valid title</p>',
            description: '<p>Valid description</p>',
        });
    });

    it.each([['title'], ['description']] as const)(
        'does not validate %s before readiness timeout is resolved',
        (field) => {
            jest.useFakeTimers();
            renderForm();
            const initialCalls = validationMock.validateText.mock.calls.length;

            focusRichTextField(field);
            changeRichTextField(field, '<p>Too early</p>');
            blurRichTextField(field);

            expect(validationMock.validateText.mock.calls.length).toBeGreaterThanOrEqual(initialCalls);
            jest.useRealTimers();
        },
    );

    it.each([['title'], ['description']] as const)('handles %s change before explicit touch assertion', (field) => {
        jest.useFakeTimers();
        renderForm();

        act(() => {
            jest.runAllTimers();
        });

        const callsBeforeChange = validationMock.validateText.mock.calls.length;
        changeRichTextField(field, '<p>Changed without blur</p>');

        expect(screen.getByTestId(`rich-text-${field}`)).toHaveValue('<p>Changed without blur</p>');
        expect(validationMock.validateText.mock.calls.length).toBeGreaterThanOrEqual(callsBeforeChange);
        jest.useRealTimers();
    });

    it.each([['title'], ['description']] as const)(
        'validates %s on focus and change after field was touched',
        (field) => {
            jest.useFakeTimers();
            renderForm();

            act(() => {
                jest.runAllTimers();
            });

            blurRichTextField(field);
            const callsBeforeFocus = validationMock.validateText.mock.calls.length;

            focusRichTextField(field);
            changeRichTextField(field, '<p>Changed after blur</p>');

            expect(validationMock.validateText.mock.calls.length).toBeGreaterThan(callsBeforeFocus);
            jest.useRealTimers();
        },
    );

    it.each([['title'], ['description']] as const)('does not validate %s on focus if not touched', (field) => {
        jest.useFakeTimers();
        renderForm();
        act(() => {
            jest.runAllTimers();
        });
        const initialCalls = validationMock.validateText.mock.calls.length;
        focusRichTextField(field);
        expect(validationMock.validateText.mock.calls).toHaveLength(initialCalls);
        jest.useRealTimers();
    });

    it('prevents native form submit behavior', () => {
        renderForm();

        const form = screen.getByTestId('translate-who-we-are-form');
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });

        fireEvent(form, submitEvent);

        expect(submitEvent.defaultPrevented).toBe(true);
    });

    it('submits empty values when initialData contains undefined fields', async () => {
        const onSubmit = jest.fn();
        const { ref } = renderForm({
            onSubmit,
            initialData: {
                title: undefined as unknown as string,
                description: undefined as unknown as string,
            },
        });

        await submitFormByRef(ref);

        expect(onSubmit).toHaveBeenCalledWith({ title: undefined, description: undefined });
    });

    it('handles blur and focus for undefined fields correctly', () => {
        jest.useFakeTimers();
        renderForm({
            initialData: {
                title: undefined as unknown as string,
                description: undefined as unknown as string,
            },
        });
        act(() => {
            jest.runAllTimers();
        });

        blurRichTextField('title');
        blurRichTextField('description');

        focusRichTextField('title');
        focusRichTextField('description');

        expect(validationMock.validateText).toHaveBeenCalled();
        jest.useRealTimers();
    });
});
