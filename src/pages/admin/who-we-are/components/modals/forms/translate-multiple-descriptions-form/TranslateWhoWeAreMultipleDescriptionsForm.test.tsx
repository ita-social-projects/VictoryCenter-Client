import React, { createRef } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
	TranslateWhoWeAreMultipleDescriptionsForm,
	TranslateWhoWeAreMultipleDescriptionsFormRef,
} from './TranslateWhoWeAreMultipleDescriptionsForm';

jest.mock('@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup', () => ({
	RichTextInputGroup: ({ id, value, onChange, onBlur, onFocus, disabled, error }: any) => (
		<div>
			<textarea
				data-testid={`rich-text-${id}`}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				onBlur={onBlur}
				onFocus={onFocus}
				disabled={disabled}
			/>
			{error && <span data-testid={`error-${id}`}>{error}</span>}
		</div>
	),
}));

jest.mock('@/validation/admin/who-we-are-schema/WhoWeAreSchema', () => ({
	WHO_WE_ARE_VALIDATION_FUNCTIONS: {
		validateText: jest.fn(() => undefined),
	},
}));

const { WHO_WE_ARE_VALIDATION_FUNCTIONS } = jest.requireMock(
	'@/validation/admin/who-we-are-schema/WhoWeAreSchema',
) as {
	WHO_WE_ARE_VALIDATION_FUNCTIONS: { validateText: jest.Mock };
};

const validationMock = WHO_WE_ARE_VALIDATION_FUNCTIONS;

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
		jest.clearAllMocks();
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

		fireEvent.change(screen.getByTestId('rich-text-description-1'), {
			target: { value: '<p>Updated row</p>' },
		});

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

		const firstField = screen.getByTestId('rich-text-description-1');

		fireEvent.focus(firstField);
		fireEvent.blur(firstField);

		await waitFor(() => {
			expect(screen.getByTestId('error-description-1')).toHaveTextContent('Required');
		});

		jest.useRealTimers();
	});

	it('submits form data via ref', async () => {
		const onSubmit = jest.fn();
		const { ref } = renderForm({ onSubmit });

		fireEvent.change(screen.getByTestId('rich-text-description-1'), {
			target: { value: '<p>New 1</p>' },
		});
		fireEvent.change(screen.getByTestId('rich-text-description-2'), {
			target: { value: '<p>New 2</p>' },
		});

		await act(async () => {
			await ref.current?.submit();
		});

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

		const firstField = screen.getByTestId('rich-text-description-1');
		fireEvent.focus(firstField);
		fireEvent.change(firstField, { target: { value: '<p>Too early row update</p>' } });
		fireEvent.blur(firstField);

		expect(validationMock.validateText.mock.calls.length).toBeGreaterThanOrEqual(initialCalls);
		jest.useRealTimers();
	});

	it('does not validate blur for untouched row after readiness timeout', () => {
		jest.useFakeTimers();
		renderForm();

		act(() => {
			jest.runAllTimers();
		});

		const callsBeforeBlur = validationMock.validateText.mock.calls.length;
		const firstField = screen.getByTestId('rich-text-description-1');
		fireEvent.blur(firstField);

		expect(validationMock.validateText.mock.calls.length).toBe(callsBeforeBlur);
		jest.useRealTimers();
	});

	it('validates on row change after readiness and prevents native submit', () => {
		jest.useFakeTimers();
		renderForm();

		act(() => {
			jest.runAllTimers();
		});

		const firstField = screen.getByTestId('rich-text-description-1');
		const form = screen.getByTestId('translate-who-we-are-multiple-descriptions-form');

		fireEvent.change(firstField, { target: { value: '<p>Ready change</p>' } });
		fireEvent.submit(form);

		expect(validationMock.validateText).toHaveBeenCalled();
		jest.useRealTimers();
	});
});
