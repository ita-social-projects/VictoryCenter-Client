import React, { createRef } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
    TranslateWhoWeAreTitleAndDescriptionForm,
    TranslateWhoWeAreTitleAndDescriptionFormRef,
} from './TranslateWhoWeAreTitleAndDescriptionForm';
import { getWhoWeAreValidationMock } from '@/utils/test-mocks/who-we-are-form-mocks';

jest.mock('@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup', () => ({
    RichTextInputGroup: (props: any) => require('@/utils/test-mocks/who-we-are-form-mocks').MockRichTextInputGroup(props),
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

        fireEvent.change(screen.getByTestId('rich-text-title'), {
            target: { value: '<p>Updated title</p>' },
        });

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

        const titleField = screen.getByTestId('rich-text-title');
        const descriptionField = screen.getByTestId('rich-text-description');

        fireEvent.focus(titleField);
        fireEvent.blur(titleField);
        fireEvent.focus(descriptionField);
        fireEvent.blur(descriptionField);

        expect(screen.getByTestId('error-title')).toHaveTextContent('Required');
        expect(screen.getByTestId('error-description')).toHaveTextContent('Required');

        jest.useRealTimers();
    });

    it('submits form data via ref', async () => {
        const onSubmit = jest.fn();
        const { ref } = renderForm({ onSubmit });

        fireEvent.change(screen.getByTestId('rich-text-title'), {
            target: { value: '<p>Valid title</p>' },
        });
        fireEvent.change(screen.getByTestId('rich-text-description'), {
            target: { value: '<p>Valid description</p>' },
        });

        await act(async () => {
            await ref.current?.submit();
        });

        expect(onSubmit).toHaveBeenCalledWith({
            title: '<p>Valid title</p>',
            description: '<p>Valid description</p>',
        });
    });

    it('does not validate before readiness timeout is resolved', () => {
        jest.useFakeTimers();
        renderForm();
        const initialCalls = validationMock.validateText.mock.calls.length;

        const titleField = screen.getByTestId('rich-text-title');

        fireEvent.focus(titleField);
        fireEvent.change(titleField, { target: { value: '<p>Too early</p>' } });
        fireEvent.blur(titleField);

        expect(validationMock.validateText.mock.calls.length).toBeGreaterThanOrEqual(initialCalls);
        jest.useRealTimers();
    });

    it('handles title change before explicit touch assertion', () => {
        jest.useFakeTimers();
        renderForm();

        act(() => {
            jest.runAllTimers();
        });

        const callsBeforeChange = validationMock.validateText.mock.calls.length;
        const titleField = screen.getByTestId('rich-text-title');
        fireEvent.change(titleField, { target: { value: '<p>Changed without blur</p>' } });

        expect(screen.getByTestId('rich-text-title')).toHaveValue('<p>Changed without blur</p>');
        expect(validationMock.validateText.mock.calls.length).toBeGreaterThanOrEqual(callsBeforeChange);
        jest.useRealTimers();
    });

    it('validates title on change after field becomes touched', () => {
        jest.useFakeTimers();
        renderForm();

        act(() => {
            jest.runAllTimers();
        });

        const titleField = screen.getByTestId('rich-text-title');
        fireEvent.blur(titleField);
        fireEvent.change(titleField, { target: { value: '<p>Changed after blur</p>' } });

        expect(validationMock.validateText).toHaveBeenCalled();
        jest.useRealTimers();
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

        await act(async () => {
            await ref.current?.submit();
        });

        expect(onSubmit).toHaveBeenCalledWith({ title: undefined, description: undefined });
    });
});
