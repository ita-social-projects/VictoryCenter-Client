import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PartnerForm, PartnerFormProps } from './PartnerForm';
import { PARTNERS_TEXT } from '../../../../../../const/admin/partners';

// Stabilize ids generated with Date.now() inside the component
let dateNowSpy: jest.SpyInstance<number, []>;
beforeAll(() => {
    dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(1700000000000);
});

afterAll(() => {
    dateNowSpy.mockRestore();
});

// Mock child components to focus tests on PartnerForm behavior
jest.mock('../../../../../../components/admin/image-input/ImageInput', () => ({
    ImageInput: ({ onChange, disabled }: { onChange: (v: any) => void; disabled?: boolean }) => (
        <button
            type="button"
            aria-label="mock-image-input"
            onClick={() => onChange({ url: 'img-url', alt: 'img-alt' })}
            disabled={disabled}
        >
            MockImageInput
        </button>
    ),
}));

jest.mock('../../../../../../components/admin/textarea-with-character-limit/TextAreaWithCharacterLimit', () => ({
    TextAreaWithCharacterLimit: (props: {
        value: string;
        onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
        id?: string;
        name?: string;
        disabled?: boolean;
        maxLength?: number;
        placeholder?: string;
        rows?: number;
    }) => <textarea aria-label="partner-description" {...props} />,
}));

jest.mock('../../../../../../components/admin/input-label/InputLabel', () => ({
    InputLabel: ({ htmlFor, text }: { htmlFor?: string; text: string }) => <label htmlFor={htmlFor}>{text}</label>,
}));

jest.mock('../../../../../../components/admin/input-error/InputError', () => ({
    InputError: ({ error }: { error: string }) => <span role="alert">{error}</span>,
}));

const createDefaultProps = (overrides: Partial<PartnerFormProps> = {}): PartnerFormProps => ({
    value: { image: null, description: '' },
    onChange: jest.fn(),
    onDelete: jest.fn(),
    onEdit: jest.fn(),
    disabled: false,
    ...overrides,
});

describe('PartnerForm', () => {
    test('renders edit/delete buttons and description input', () => {
        const props = createDefaultProps();
        render(<PartnerForm {...props} />);

        expect(screen.getByRole('button', { name: PARTNERS_TEXT.PARTNER.EDIT })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: PARTNERS_TEXT.PARTNER.DELETE })).toBeInTheDocument();

        // By label text (provided via mocked InputLabel)
        expect(screen.getByLabelText('Опис партнера')).toBeInTheDocument();

        // Mocked ImageInput presence
        expect(screen.getByRole('button', { name: 'mock-image-input' })).toBeInTheDocument();
    });

    test('calls onEdit when edit button clicked', () => {
        const props = createDefaultProps();
        render(<PartnerForm {...props} />);
        fireEvent.click(screen.getByRole('button', { name: PARTNERS_TEXT.PARTNER.EDIT }));
        expect(props.onEdit).toHaveBeenCalledTimes(1);
    });

    test('calls onDelete when delete button clicked', () => {
        const props = createDefaultProps();
        render(<PartnerForm {...props} />);
        fireEvent.click(screen.getByRole('button', { name: PARTNERS_TEXT.PARTNER.DELETE }));
        expect(props.onDelete).toHaveBeenCalledTimes(1);
    });

    test('updates description and calls onChange with new value', () => {
        const props = createDefaultProps({ value: { image: null, description: '' } });
        render(<PartnerForm {...props} />);
        const textarea = screen.getByLabelText('Опис партнера');
        fireEvent.change(textarea, { target: { value: 'New description' } });

        expect(props.onChange).toHaveBeenCalled();
        const lastCallArg = (props.onChange as jest.Mock).mock.calls.pop()[0];
        expect(lastCallArg).toEqual({ image: null, description: 'New description' });
    });

    test('updates image via ImageInput and calls onChange with new image', () => {
        const props = createDefaultProps({ value: { image: null, description: '' } });
        render(<PartnerForm {...props} />);

        fireEvent.click(screen.getByRole('button', { name: 'mock-image-input' }));

        expect(props.onChange).toHaveBeenCalled();
        const lastCallArg = (props.onChange as jest.Mock).mock.calls.pop()[0];
        expect(lastCallArg).toEqual({ image: { url: 'img-url', alt: 'img-alt' }, description: '' });
    });

    test('shows error messages when provided', () => {
        const props = createDefaultProps({
            error: { image: 'Image error', description: 'Description error' },
        });
        render(<PartnerForm {...props} />);
        expect(screen.getByText('Image error')).toBeInTheDocument();
        expect(screen.getByText('Description error')).toBeInTheDocument();
    });

    test('respects disabled state', () => {
        const props = createDefaultProps({ disabled: true });
        render(<PartnerForm {...props} />);

        expect(screen.getByRole('button', { name: PARTNERS_TEXT.PARTNER.EDIT })).toBeDisabled();
        expect(screen.getByRole('button', { name: PARTNERS_TEXT.PARTNER.DELETE })).toBeDisabled();
        expect(screen.getByLabelText('Опис партнера')).toBeDisabled();
        expect(screen.getByRole('button', { name: 'mock-image-input' })).toBeDisabled();
    });
});
