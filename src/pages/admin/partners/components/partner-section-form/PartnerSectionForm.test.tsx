import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PartnerSectionForm, PartnerSectionFormProps } from './PartnerSectionForm';
import { PartnerSectionFormValues, PartnerFormValues } from '../../../../../types/admin/partners';
import { PARTNER_SECTION_VALIDATION } from '../../../../../validation/admin/partner-schema/partner-schema';

// Мокаємо іконку
jest.mock('../../../../../assets/icons/plus.svg', () => ({
    ReactComponent: () => <div data-testid="plus-icon">Plus Icon</div>,
}));

// Мокаємо компоненти
jest.mock('../../../../../components/admin/input-label/InputLabel', () => ({
    InputLabel: ({ text, isRequired }: any) => (
        <label>
            {text} {isRequired && <span>*</span>}
        </label>
    ),
}));

jest.mock('../../../../../components/admin/textarea-with-character-limit/TextAreaWithCharacterLimit', () => ({
    TextAreaWithCharacterLimit: ({ value, onChange, id, disabled, maxLength, placeholder, rows }: any) => (
        <textarea
            id={id}
            value={value}
            onChange={onChange}
            disabled={disabled}
            maxLength={maxLength}
            placeholder={placeholder}
            rows={rows}
            data-testid={id}
        />
    ),
}));

jest.mock('../../../../../components/admin/input-error/InputError', () => ({
    InputError: ({ error }: any) => <div data-testid="input-error">{error}</div>,
}));

jest.mock('../../../../../components/admin/button/Button', () => ({
    Button: ({ children, onClick, disabled, buttonStyle }: any) => (
        <button onClick={onClick} disabled={disabled} data-button-style={buttonStyle}>
            {children}
        </button>
    ),
}));

jest.mock('./partner-form/PartnerForm', () => ({
    PartnerForm: ({ value, onChange, onDelete, onEdit, error }: any) => (
        <div data-testid="partner-form">
            <div>Image: {value.image ? 'has-image' : 'no-image'}</div>
            <div>Description: {value.description}</div>
            <button onClick={() => onChange({ ...value, description: 'changed' })}>Change</button>
            <button onClick={onDelete}>Delete</button>
            <button onClick={onEdit}>Edit</button>
            {error?.image && <div data-testid="partner-image-error">{error.image}</div>}
            {error?.description && <div data-testid="partner-description-error">{error.description}</div>}
        </div>
    ),
}));

// Мокаємо валідацію
jest.mock('../../../../../validation/admin/partner-schema/partner-schema', () => ({
    PARTNER_SECTION_VALIDATION: {
        validateSectionTitle: jest.fn((value: string) => {
            if (!value) return 'Title is required';
            if (value.length > 100) return 'Title is too long';
            return undefined;
        }),
        validateSectionDescription: jest.fn((value: string) => {
            if (!value) return 'Description is required';
            if (value.length > 500) return 'Description is too long';
            return undefined;
        }),
        validatePartnerImage: jest.fn((value: any) => {
            if (!value) return 'Image is required';
            return undefined;
        }),
        validatePartnerDescription: jest.fn((value: string) => {
            if (!value) return 'Description is required';
            return undefined;
        }),
    },
}));

// Мокаємо константи
jest.mock('../../../../../const/admin/partners', () => ({
    PARTNER_VALIDATION: {
        title: { max: 100 },
        description: { max: 500 },
    },
    PARTNERS_TEXT: {
        FORM: {
            LABEL: {
                TITLE: 'Section Title',
                DESCRIPTION: 'Section Description',
            },
        },
        SECTION: {
            TITLE_PLACEHOLDER: 'Enter section title',
            DESCRIPTION_PLACEHOLDER: 'Enter section description',
            EMPTY_MESSAGE: 'No partners added yet',
            DELETE_SECTION: 'Delete Section',
        },
        BUTTON: {
            ADD_PARTNER: 'Add Partner',
            PUBLISH: 'Publish',
        },
    },
}));

describe('PartnerSectionForm', () => {
    const mockPartner: PartnerFormValues = {
        image: { url: 'test-image.jpg', alt: 'Test image' } as any,
        description: 'Test partner description',
    };

    const mockValue: PartnerSectionFormValues = {
        title: 'Test Section',
        description: 'Test section description',
        partners: [mockPartner],
    };

    const defaultProps: PartnerSectionFormProps = {
        value: mockValue,
        onChange: jest.fn(),
        onDelete: jest.fn(),
        onEdit: jest.fn(),
        onPublish: jest.fn(),
        disabled: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render all form fields', () => {
            render(<PartnerSectionForm {...defaultProps} />);

            expect(screen.getByText('Section Title')).toBeInTheDocument();
            expect(screen.getByText('Section Description')).toBeInTheDocument();
            expect(screen.getByTestId('section-title')).toBeInTheDocument();
            expect(screen.getByTestId('section-description')).toBeInTheDocument();
        });

        it('should render partners list with correct count', () => {
            render(<PartnerSectionForm {...defaultProps} />);

            expect(screen.getByText('Партнери (1)')).toBeInTheDocument();
            expect(screen.getAllByTestId('partner-form')).toHaveLength(1);
        });

        it('should render empty message when no partners', () => {
            const emptyProps = {
                ...defaultProps,
                value: { ...mockValue, partners: [] },
            };

            render(<PartnerSectionForm {...emptyProps} />);

            expect(screen.getByText('No partners added yet')).toBeInTheDocument();
        });

        it('should render action buttons', () => {
            render(<PartnerSectionForm {...defaultProps} />);

            expect(screen.getByText('Delete Section')).toBeInTheDocument();
            expect(screen.getByText('Publish')).toBeInTheDocument();
        });

        it('should render add partner button', () => {
            render(<PartnerSectionForm {...defaultProps} />);

            expect(screen.getByText('Add Partner')).toBeInTheDocument();
        });
    });

    describe('Title handling', () => {
        it('should call onChange when title changes', async () => {
            const onChange = jest.fn();
            render(<PartnerSectionForm {...defaultProps} onChange={onChange} />);

            const titleInput = screen.getByTestId('section-title');
            await userEvent.clear(titleInput);
            await userEvent.type(titleInput, 'New Title');

            expect(onChange).toHaveBeenCalled();
        });

        it('should validate title and show error', async () => {
            render(<PartnerSectionForm {...defaultProps} />);

            const titleInput = screen.getByTestId('section-title');
            await userEvent.clear(titleInput);
            fireEvent.blur(titleInput);

            await waitFor(() => {
                expect(PARTNER_SECTION_VALIDATION.validateSectionTitle).toHaveBeenCalled();
            });
        });

        it('should display title error from props', () => {
            const propsWithError = {
                ...defaultProps,
                errors: { title: 'Title error from props' },
            };

            render(<PartnerSectionForm {...propsWithError} />);

            expect(screen.getByText('Title error from props')).toBeInTheDocument();
        });
    });

    describe('Description handling', () => {
        it('should call onChange when description changes', async () => {
            const onChange = jest.fn();
            render(<PartnerSectionForm {...defaultProps} onChange={onChange} />);

            const descInput = screen.getByTestId('section-description');
            await userEvent.clear(descInput);
            await userEvent.type(descInput, 'New Description');

            expect(onChange).toHaveBeenCalled();
        });

        it('should validate description and show error', async () => {
            render(<PartnerSectionForm {...defaultProps} />);

            const descInput = screen.getByTestId('section-description');
            await userEvent.clear(descInput);
            fireEvent.blur(descInput);

            await waitFor(() => {
                expect(PARTNER_SECTION_VALIDATION.validateSectionDescription).toHaveBeenCalled();
            });
        });

        it('should display description error from props', () => {
            const propsWithError = {
                ...defaultProps,
                errors: { description: 'Description error from props' },
            };

            render(<PartnerSectionForm {...propsWithError} />);

            expect(screen.getByText('Description error from props')).toBeInTheDocument();
        });
    });

    describe('Partner operations', () => {
        it('should add new partner when add button clicked', () => {
            const onChange = jest.fn();
            render(<PartnerSectionForm {...defaultProps} onChange={onChange} />);

            // Шукаємо button, а не span
            const addButton = screen.getByRole('button', { name: /add partner/i });
            fireEvent.click(addButton);

            expect(onChange).toHaveBeenCalledWith({
                ...mockValue,
                partners: [...mockValue.partners, { image: null, description: '' }],
            });
        });

        it('should disable add button when max partners reached', () => {
            const maxPartners = Array(10).fill(mockPartner);
            const propsWithMax = {
                ...defaultProps,
                value: { ...mockValue, partners: maxPartners },
            };

            render(<PartnerSectionForm {...propsWithMax} />);

            // Шукаємо button element
            const addButton = screen.getByRole('button', { name: /add partner/i });
            expect(addButton).toBeDisabled();
        });

        it('should delete partner when delete clicked', () => {
            const onChange = jest.fn();
            const secondPartner: PartnerFormValues = {
                image: { url: 'second.jpg', alt: 'Second' } as any,
                description: 'Second partner',
            };

            const propsWithMultiple = {
                ...defaultProps,
                onChange,
                value: {
                    ...mockValue,
                    partners: [mockPartner, secondPartner],
                },
            };

            render(<PartnerSectionForm {...propsWithMultiple} />);

            const deleteButtons = screen.getAllByText('Delete');
            fireEvent.click(deleteButtons[0]);

            expect(onChange).toHaveBeenCalledWith({
                ...mockValue,
                partners: [secondPartner],
            });
        });

        it('should handle partner change', () => {
            const onChange = jest.fn();
            render(<PartnerSectionForm {...defaultProps} onChange={onChange} />);

            const changeButton = screen.getByText('Change');
            fireEvent.click(changeButton);

            expect(onChange).toHaveBeenCalled();
        });

        it('should handle partner edit toggle', () => {
            render(<PartnerSectionForm {...defaultProps} />);

            const editButton = screen.getByText('Edit');
            fireEvent.click(editButton);

            expect(editButton).toBeInTheDocument();
        });
    });

    describe('Drag and Drop', () => {
        it('should handle drag start', () => {
            const secondPartner: PartnerFormValues = {
                image: { url: 'second.jpg', alt: 'Second' } as any,
                description: 'Second',
            };

            const propsWithMultiple = {
                ...defaultProps,
                value: {
                    ...mockValue,
                    partners: [mockPartner, secondPartner],
                },
            };

            render(<PartnerSectionForm {...propsWithMultiple} />);

            const wrappers = screen.getAllByTestId('partner-form').map((el) => el.parentElement);
            fireEvent.dragStart(wrappers[0]!);

            expect(wrappers[0]).toBeInTheDocument();
        });

        it('should handle drag over', () => {
            const secondPartner: PartnerFormValues = {
                image: { url: 'second.jpg', alt: 'Second' } as any,
                description: 'Second',
            };

            const propsWithMultiple = {
                ...defaultProps,
                value: {
                    ...mockValue,
                    partners: [mockPartner, secondPartner],
                },
            };

            render(<PartnerSectionForm {...propsWithMultiple} />);

            const wrappers = screen.getAllByTestId('partner-form').map((el) => el.parentElement);
            fireEvent.dragStart(wrappers[0]!);
            fireEvent.dragOver(wrappers[1]!);

            expect(wrappers[1]).toBeInTheDocument();
        });

        it('should reorder partners on drop', () => {
            const onChange = jest.fn();
            const firstPartner: PartnerFormValues = {
                image: { url: 'first.jpg', alt: 'First' } as any,
                description: 'First',
            };
            const secondPartner: PartnerFormValues = {
                image: { url: 'second.jpg', alt: 'Second' } as any,
                description: 'Second',
            };

            const propsWithMultiple = {
                ...defaultProps,
                onChange,
                value: {
                    ...mockValue,
                    partners: [firstPartner, secondPartner],
                },
            };

            render(<PartnerSectionForm {...propsWithMultiple} />);

            const wrappers = screen.getAllByTestId('partner-form').map((el) => el.parentElement);

            fireEvent.dragStart(wrappers[0]!);
            fireEvent.drop(wrappers[1]!);

            expect(onChange).toHaveBeenCalledWith({
                ...mockValue,
                partners: [secondPartner, firstPartner],
            });
        });

        it('should handle drag end', () => {
            render(<PartnerSectionForm {...defaultProps} />);

            const wrapper = screen.getByTestId('partner-form').parentElement;
            fireEvent.dragStart(wrapper!);
            fireEvent.dragEnd(wrapper!);

            expect(wrapper).toBeInTheDocument();
        });

        it('should handle drag leave', () => {
            render(<PartnerSectionForm {...defaultProps} />);

            const wrapper = screen.getByTestId('partner-form').parentElement;
            fireEvent.dragLeave(wrapper!);

            expect(wrapper).toBeInTheDocument();
        });
    });

    describe('Form validation', () => {
        it('should disable publish button when form is invalid', () => {
            const invalidProps = {
                ...defaultProps,
                value: { ...mockValue, title: '' },
            };

            render(<PartnerSectionForm {...invalidProps} />);

            const publishButton = screen.getByRole('button', { name: /publish/i });
            expect(publishButton).toBeDisabled();
        });

        it('should enable publish button when form is valid', () => {
            render(<PartnerSectionForm {...defaultProps} />);

            const publishButton = screen.getByRole('button', { name: /publish/i });
            expect(publishButton).not.toBeDisabled();
        });

        it('should disable publish button when no partners', () => {
            const noPartnersProps = {
                ...defaultProps,
                value: { ...mockValue, partners: [] },
            };

            render(<PartnerSectionForm {...noPartnersProps} />);

            const publishButton = screen.getByRole('button', { name: /publish/i });
            expect(publishButton).toBeDisabled();
        });

        it('should disable publish button when partners have no image', () => {
            const invalidPartnerProps = {
                ...defaultProps,
                value: {
                    ...mockValue,
                    partners: [{ image: null, description: 'Test' }],
                },
            };

            render(<PartnerSectionForm {...invalidPartnerProps} />);

            const publishButton = screen.getByRole('button', { name: /publish/i });
            expect(publishButton).toBeDisabled();
        });

        it('should disable publish button when partners have empty description', () => {
            const invalidPartnerProps = {
                ...defaultProps,
                value: {
                    ...mockValue,
                    partners: [{ image: { url: 'test.jpg', alt: 'Test' } as any, description: '   ' }],
                },
            };

            render(<PartnerSectionForm {...invalidPartnerProps} />);

            const publishButton = screen.getByRole('button', { name: /publish/i });
            expect(publishButton).toBeDisabled();
        });

        it('should disable publish button when there are validation errors', () => {
            const propsWithErrors = {
                ...defaultProps,
                value: {
                    ...mockValue,
                    title: '', // Невалідний title
                },
                errors: {
                    title: 'Title error',
                },
            };

            render(<PartnerSectionForm {...propsWithErrors} />);

            const publishButton = screen.getByRole('button', { name: /publish/i });
            expect(publishButton).toBeDisabled();
        });
    });

    describe('Disabled state', () => {
        it('should disable all inputs when disabled prop is true', () => {
            const disabledProps = { ...defaultProps, disabled: true };

            render(<PartnerSectionForm {...disabledProps} />);

            expect(screen.getByTestId('section-title')).toBeDisabled();
            expect(screen.getByTestId('section-description')).toBeDisabled();

            // Шукаємо button element
            const addButton = screen.getByRole('button', { name: /add partner/i });
            expect(addButton).toBeDisabled();
        });

        it('should disable drag when disabled prop is true', () => {
            const disabledProps = { ...defaultProps, disabled: true };

            render(<PartnerSectionForm {...disabledProps} />);

            const wrapper = screen.getByTestId('partner-form').parentElement;
            expect(wrapper?.getAttribute('draggable')).toBe('false');
        });
    });

    describe('Action buttons', () => {
        it('should call onDelete when delete button clicked', () => {
            const onDelete = jest.fn();
            render(<PartnerSectionForm {...defaultProps} onDelete={onDelete} />);

            const deleteButton = screen.getByRole('button', { name: /delete section/i });
            fireEvent.click(deleteButton);

            expect(onDelete).toHaveBeenCalled();
        });

        it('should call onPublish when publish button clicked', () => {
            const onPublish = jest.fn();
            render(<PartnerSectionForm {...defaultProps} onPublish={onPublish} />);

            const publishButton = screen.getByRole('button', { name: /publish/i });
            fireEvent.click(publishButton);

            expect(onPublish).toHaveBeenCalled();
        });

        it('should not call onPublish when form is invalid', () => {
            const onPublish = jest.fn();
            const invalidProps = {
                ...defaultProps,
                onPublish,
                value: { ...mockValue, title: '' },
            };

            render(<PartnerSectionForm {...invalidProps} />);

            const publishButton = screen.getByRole('button', { name: /publish/i });
            expect(publishButton).toBeDisabled();
        });
    });

    describe('Ref forwarding', () => {
        it('should forward ref correctly', () => {
            const ref = React.createRef<HTMLDivElement>();
            render(<PartnerSectionForm {...defaultProps} ref={ref} />);

            expect(ref.current).toBeInstanceOf(HTMLDivElement);
            expect(ref.current?.className).toContain('partner-section');
        });
    });

    describe('Partner errors display', () => {
        it('should display partner errors from props', () => {
            const propsWithPartnerErrors = {
                ...defaultProps,
                errors: {
                    partners: [
                        {
                            image: 'Image error',
                            description: 'Description error',
                        },
                    ],
                },
            };

            render(<PartnerSectionForm {...propsWithPartnerErrors} />);

            expect(screen.getByText('Image error')).toBeInTheDocument();
            expect(screen.getByText('Description error')).toBeInTheDocument();
        });
    });
});
