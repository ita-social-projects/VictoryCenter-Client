import React, { createRef } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
    TranslateWhoWeAreMultipleDescriptionsForm,
    TranslateWhoWeAreMultipleDescriptionsFormRef,
} from './TranslateWhoWeAreMultipleDescriptionsForm';
import { getWhoWeAreValidationMock } from '@/utils/test-mocks/who-we-are-form-mocks';
import {
    blurRichTextField,
    changeRichTextField,
    focusRichTextField,
    submitFormByRef,
} from '@/pages/admin/who-we-are/components/modals/forms/shared/form-test-helpers';

jest.mock('@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup', () => ({
    RichTextInputGroup: (props: any) => require('@/utils/test-mocks/who-we-are-form-mocks').MockRichTextInputGroup(props),
}));

jest.mock(
    '@/validation/admin/who-we-are-schema/WhoWeAreSchema',
    () => require('@/utils/test-mocks/who-we-are-form-mocks').mockWhoWeAreSchemaModule,
);

const validationMock = getWhoWeAreValidationMock();

const initialData = {
    rows: [
        {
            contentId: 1,
            description: '<p>Existing 1</p>',
            image: 'image-1.jpg',
        },
        {
            contentId: 2,
            description: '<p>Existing 2</p>',
            image: 'image-2.jpg',
        },
    ],
};

describe('TranslateWhoWeAreMultipleDescriptionsForm', () => {
    const renderForm = (
        props: Partial<React.ComponentProps<typeof TranslateWhoWeAreMultipleDescriptionsForm>> = {},
    ) => {
        const ref = createRef<TranslateWhoWeAreMultipleDescriptionsFormRef>();
        const defaultProps: React.ComponentProps<typeof TranslateWhoWeAreMultipleDescriptionsForm> = {
            onSubmit: jest.fn(),
            limits: { descriptionLimit: 500 },
            initialData,
        };

        render(<TranslateWhoWeAreMultipleDescriptionsForm ref={ref} {...defaultProps} {...props} />);

        return {
            ref,
            onSubmit: props.onSubmit ?? defaultProps.onSubmit,
        };
    };

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('renders rows with default descriptions and images', () => {
        renderForm();

        const firstField = screen.getByTestId('rich-text-description-1');
        const secondField = screen.getByTestId('rich-text-description-2');

        expect(firstField).toBeInTheDocument();
        expect(secondField).toBeInTheDocument();
        expect(firstField).toHaveValue('<p>Existing 1</p>');
        expect(secondField).toHaveValue('<p>Existing 2</p>');
        expect(screen.getAllByRole('img')).toHaveLength(2);
    });

    it('updates a row description and marks form as dirty', async () => {
        const onDirtyChange = jest.fn();
        renderForm({ onDirtyChange });

        changeRichTextField('description-1', '<p>Updated row</p>');

        await waitFor(() => {
            expect(onDirtyChange).toHaveBeenCalledWith(true);
        });
    });

    it('shows validation error on row blur', async () => {
        jest.useFakeTimers();
        validationMock.validateText.mockReturnValue('Required');

        renderForm();

        act(() => {
            jest.runAllTimers();
        });

        focusRichTextField('description-1');
        blurRichTextField('description-1');

        await waitFor(() => {
            expect(screen.getByTestId('error-description-1')).toHaveTextContent('Required');
        });

        jest.useRealTimers();
    });

    it('submits form data via ref', async () => {
        const onSubmit = jest.fn();
        const { ref } = renderForm({ onSubmit });

        changeRichTextField('description-1', '<p>New 1</p>');
        changeRichTextField('description-2', '<p>New 2</p>');

        await submitFormByRef(ref);

        expect(onSubmit).toHaveBeenCalledWith({
            rows: [
                { contentId: 1, description: '<p>New 1</p>', image: 'image-1.jpg' },
                { contentId: 2, description: '<p>New 2</p>', image: 'image-2.jpg' },
            ],
        });
    });

    it('renders empty rows when initialData is not provided', () => {
        renderForm({ initialData: null as any });

        expect(screen.queryByTestId('rich-text-description-1')).not.toBeInTheDocument();
        expect(screen.queryAllByRole('img')).toHaveLength(0);
    });

    it('does not validate row interactions before readiness timeout', () => {
        jest.useFakeTimers();
        renderForm();
        const initialCalls = validationMock.validateText.mock.calls.length;

        focusRichTextField('description-1');
        blurRichTextField('description-1');

        expect(validationMock.validateText).toHaveBeenCalledTimes(initialCalls);
        jest.useRealTimers();
    });

    it('does not validate blur for untouched row after readiness timeout', () => {
        jest.useFakeTimers();
        renderForm();

        act(() => {
            jest.runAllTimers();
        });

        const callsBeforeBlur = validationMock.validateText.mock.calls.length;
        blurRichTextField('description-1');

        expect(validationMock.validateText.mock.calls.length).toBe(callsBeforeBlur);
        jest.useRealTimers();
    });

    it('validates on row change after readiness and prevents native submit', () => {
        jest.useFakeTimers();
        renderForm();

        act(() => {
            jest.runAllTimers();
        });

        const form = screen.getByTestId('translate-who-we-are-multiple-descriptions-form');

        changeRichTextField('description-1', '<p>Ready change</p>');
        fireEvent.submit(form);

        expect(validationMock.validateText).toHaveBeenCalled();
        jest.useRealTimers();
    });
});
