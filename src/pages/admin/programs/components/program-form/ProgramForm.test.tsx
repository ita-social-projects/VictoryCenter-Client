import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProgramForm, ProgramFormProps, ProgramFormRef, ProgramFormValues } from './ProgramForm';
import { PROGRAM_VALIDATION_FUNCTIONS } from '../../../../../validation/admin/program-schema/program-schema';
import { VisibilityStatus } from '../../../../../types/admin/common';
import { ProgramCategory } from '../../../../../types/admin/programs';
import { InputWithCharacterLimitGroupProps } from '../../../../../components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroupProps } from '../../../../../components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { MultiSelectInputGroupProps } from '../../../../../components/admin/input-groups/multi-select-input-group/MultiSelectInputGroup';
import { PhotoInputGroupProps } from '../../../../../components/admin/input-groups/photo-input-group/PhotoInputGroup';
import { ButtonProps } from '@mui/material';

jest.mock('../../../../../validation/admin/program-schema/program-schema', () => ({
    PROGRAM_VALIDATION_FUNCTIONS: {
        validateName: jest.fn(),
        validateCategories: jest.fn(),
        validateDescription: jest.fn(),
        validatePreviewImage: jest.fn(),
        validateBackgroundImage: jest.fn(),
        validateLocation: jest.fn(),
        validateParticipantsCount: jest.fn(),
        validateMeetingCount: jest.fn(),
    },
}));

jest.mock(
    '../../../../../components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup',
    () => ({
        InputWithCharacterLimitGroup: ({
            label,
            value,
            onChange,
            onBlur,
            error,
            id,
        }: InputWithCharacterLimitGroupProps) => (
            <div data-testid={`group-${id}`}>
                <label htmlFor={id}>{label}</label>
                <input id={id} data-testid={`input-${id}`} value={value} onChange={onChange} onBlur={onBlur} />
                {error && <span data-testid={`error-${id}`}>{error}</span>}
            </div>
        ),
    }),
);

jest.mock(
    '../../../../../components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup',
    () => ({
        TextAreaWithCharacterLimitGroup: ({
            label,
            value,
            onChange,
            onBlur,
            error,
            id,
        }: TextAreaWithCharacterLimitGroupProps) => (
            <div data-testid={`group-${id}`}>
                <label htmlFor={id}>{label}</label>
                <textarea id={id} data-testid={`input-${id}`} value={value} onChange={onChange} onBlur={onBlur} />
                {error && <span data-testid={`error-${id}`}>{error}</span>}
            </div>
        ),
    }),
);

jest.mock('../../../../../components/admin/input-groups/multi-select-input-group/MultiSelectInputGroup', () => ({
    MultiSelectInputGroup: ({
        label,
        value,
        onChange,
        onBlur,
        error,
        id,
        options,
    }: MultiSelectInputGroupProps<ProgramCategory>) => (
        <div data-testid={`group-${id}`}>
            <label>{label}</label>
            <div data-testid={`select-${id}`} onClick={() => onChange && onChange([options[0]])}>
                {value?.map((v) => v.name).join(', ')}
            </div>
            {onBlur && (
                <button type="button" data-testid={`blur-${id}`} onClick={onBlur}>
                    Blur
                </button>
            )}
            {error && <span data-testid={`error-${id}`}>{error}</span>}
        </div>
    ),
}));

jest.mock('../../../../../components/admin/input-groups/photo-input-group/PhotoInputGroup', () => ({
    PhotoInputGroup: ({ id, value, onChange, error, setError }: PhotoInputGroupProps) => (
        <div data-testid={`group-${id}`}>
            <span data-testid={`value-${id}`}>{value ? 'HasImage' : 'NoImage'}</span>
            <button
                type="button"
                data-testid={`upload-${id}`}
                onClick={() => onChange({ base64: 'test-base64', mimeType: 'image/png' })}
            >
                Upload
            </button>
            <button
                type="button"
                data-testid={`error-trigger-${id}`}
                onClick={() => setError && setError('Manual Error')}
            >
                Set Error
            </button>
            {error && <span data-testid={`error-${id}`}>{error}</span>}
        </div>
    ),
}));

jest.mock('../../../../../components/admin/button/Button', () => ({
    Button: ({ children, onClick, disabled }: ButtonProps) => (
        <button type="button" onClick={onClick} disabled={disabled} data-testid="add-section-btn">
            {children}
        </button>
    ),
}));

jest.mock('../../../../../assets/icons/plus.svg', () => ({
    ReactComponent: () => <svg>PlusIcon</svg>,
}));

describe('ProgramForm', () => {
    const mockOnSubmit = jest.fn();
    const mockOnAddSection = jest.fn();
    const mockOnValidationChange = jest.fn();

    const mockCategories: ProgramCategory[] = [
        { id: 1, name: 'Tech', programsCount: 5 },
        { id: 2, name: 'Art', programsCount: 2 },
    ];

    const defaultProps: ProgramFormProps = {
        onSubmit: mockOnSubmit,
        categories: mockCategories,
        onAddSection: mockOnAddSection,
        onValidationChange: mockOnValidationChange,
        isFormDisabled: false,
    };

    const renderProgramForm = (props: Partial<ProgramFormProps> = {}, ref?: React.Ref<ProgramFormRef>) => {
        return render(<ProgramForm {...defaultProps} {...props} ref={ref} />);
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render all input fields with empty initial values', () => {
            renderProgramForm();

            expect(screen.getByTestId('input-name')).toHaveValue('');
            expect(screen.getByTestId('input-location')).toHaveValue('');
            expect(screen.getByTestId('input-participantsCount')).toHaveValue('');
            expect(screen.getByTestId('input-meetingCount')).toHaveValue('');
            expect(screen.getByTestId('input-description')).toHaveValue('');
            expect(screen.getByTestId('value-backgroundImage')).toHaveTextContent('NoImage');
            expect(screen.getByTestId('value-previewImage')).toHaveTextContent('NoImage');
        });

        it('should render with initial data when provided', () => {
            const initialData: ProgramFormValues = {
                name: 'Initial Name',
                categories: [mockCategories[0]],
                description: 'Initial Desc',
                previewImage: { base64: 'prev', mimeType: 'img/png' },
                previewImageId: 1,
                backgroundImage: { base64: 'bg', mimeType: 'img/png' },
                backgroundImageId: 2,
                location: 'Kyiv',
                participantsCount: '10',
                meetingCount: '5',
            };

            renderProgramForm({ initialData });

            expect(screen.getByTestId('input-name')).toHaveValue('Initial Name');
            expect(screen.getByTestId('input-location')).toHaveValue('Kyiv');
            expect(screen.getByTestId('value-backgroundImage')).toHaveTextContent('HasImage');
        });

        it('should call onAddSection when the add button is clicked', () => {
            renderProgramForm();
            fireEvent.click(screen.getByTestId('add-section-btn'));
            expect(mockOnAddSection).toHaveBeenCalled();
        });
    });

    describe('Interactions and State Updates', () => {
        it('should update text fields on change', () => {
            renderProgramForm();

            const nameInput = screen.getByTestId('input-name');
            fireEvent.change(nameInput, { target: { value: 'New Program' } });

            expect(nameInput).toHaveValue('New Program');
        });

        it('should update categories on change', () => {
            renderProgramForm();
            const selectDiv = screen.getByTestId('select-toolbar-categories');

            fireEvent.click(selectDiv);

            expect(selectDiv).toHaveTextContent('Tech');
        });

        it('should update images on upload', () => {
            renderProgramForm();
            const uploadBtn = screen.getByTestId('upload-backgroundImage');

            fireEvent.click(uploadBtn);

            expect(screen.getByTestId('value-backgroundImage')).toHaveTextContent('HasImage');
        });
    });

    describe('Validation Wiring', () => {
        it('should trigger validation and show error on blur for text fields', () => {
            (PROGRAM_VALIDATION_FUNCTIONS.validateName as jest.Mock).mockReturnValue('Name Error');
            renderProgramForm();

            const nameInput = screen.getByTestId('input-name');
            fireEvent.blur(nameInput);

            expect(PROGRAM_VALIDATION_FUNCTIONS.validateName).toHaveBeenCalled();
            expect(screen.getByTestId('error-name')).toHaveTextContent('Name Error');
        });

        it('should trigger validation for categories on blur', () => {
            (PROGRAM_VALIDATION_FUNCTIONS.validateCategories as jest.Mock).mockReturnValue('Category Error');
            renderProgramForm();

            fireEvent.click(screen.getByTestId('blur-toolbar-categories'));

            expect(screen.getByTestId('error-toolbar-categories')).toHaveTextContent('Category Error');
        });

        it('should allow manual error setting for images via child component props', () => {
            renderProgramForm();
            fireEvent.click(screen.getByTestId('error-trigger-previewImage'));
            expect(screen.getByTestId('error-previewImage')).toHaveTextContent('Manual Error');
        });
    });

    describe('Ref Methods (submit, isDirty, isValid)', () => {
        it('should return true for isDirty when form is changed', () => {
            const ref = React.createRef<ProgramFormRef>();
            renderProgramForm({}, ref);

            expect(ref.current?.isDirty()).toBe(false);

            fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'Changed' } });

            expect(ref.current?.isDirty()).toBe(true);
        });

        it('should call onSubmit with correct data when submit is called via ref and form is valid', async () => {
            const ref = React.createRef<ProgramFormRef>();
            renderProgramForm({}, ref);

            Object.values(PROGRAM_VALIDATION_FUNCTIONS).forEach((fn) => (fn as jest.Mock).mockReturnValue(undefined));

            fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'Valid Name' } });

            await act(async () => {
                await ref.current?.submit(VisibilityStatus.Published);
            });

            expect(mockOnSubmit).toHaveBeenCalledWith(
                expect.objectContaining({ name: 'Valid Name' }),
                VisibilityStatus.Published,
            );
        });

        it('should NOT call onSubmit if validation fails during submit', async () => {
            const ref = React.createRef<ProgramFormRef>();
            renderProgramForm({}, ref);

            (PROGRAM_VALIDATION_FUNCTIONS.validateName as jest.Mock).mockReturnValue('Required');

            await act(async () => {
                await ref.current?.submit(VisibilityStatus.Published);
            });

            expect(PROGRAM_VALIDATION_FUNCTIONS.validateName).toHaveBeenCalled();
            expect(mockOnSubmit).not.toHaveBeenCalled();
            expect(screen.getByTestId('error-name')).toHaveTextContent('Required');
        });

        it('isValid should return false if validation functions return errors', () => {
            const ref = React.createRef<ProgramFormRef>();
            renderProgramForm({}, ref);

            (PROGRAM_VALIDATION_FUNCTIONS.validateName as jest.Mock).mockReturnValue('Error');

            expect(ref.current?.isValid(false)).toBe(false);
        });

        it('isValid should return true if validation functions return no errors', () => {
            const ref = React.createRef<ProgramFormRef>();
            renderProgramForm({}, ref);

            Object.values(PROGRAM_VALIDATION_FUNCTIONS).forEach((fn) => (fn as jest.Mock).mockReturnValue(undefined));

            expect(ref.current?.isValid(false)).toBe(true);
        });
    });
});
