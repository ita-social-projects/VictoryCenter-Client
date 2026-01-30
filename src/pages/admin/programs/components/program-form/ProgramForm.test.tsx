import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProgramForm, ProgramFormProps, ProgramFormRef, ProgramFormValues } from './ProgramForm';
import { PROGRAM_VALIDATION_FUNCTIONS } from '@/validation/admin/program-schema/program-schema';
import { VisibilityStatus } from '@/types/admin/common';
import { ProgramCategory } from '@/types/admin/programs';
import { InputWithCharacterLimitGroupProps } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroupProps } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { MultiSelectInputGroupProps } from '@/components/admin/input-groups/multi-select-input-group/MultiSelectInputGroup';
import { PhotoInputGroupProps } from '@/components/admin/input-groups/photo-input-group/PhotoInputGroup';
import { ButtonProps } from '@/components/admin/button/Button';
import { ProgramSection } from '@/types/common/program-sections';

jest.mock('@/validation/admin/program-schema/program-schema', () => ({
    PROGRAM_VALIDATION_FUNCTIONS: {
        validateName: jest.fn(),
        validateCategories: jest.fn(),
        validateDescription: jest.fn(),
        validatePreviewImage: jest.fn(),
        validateBackgroundImage: jest.fn(),
        validateLocation: jest.fn(),
        validateParticipantsCount: jest.fn(),
        validateMeetingCount: jest.fn(),
        validateSections: jest.fn(),
    },
}));

jest.mock('@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup', () => ({
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
}));

jest.mock(
    '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup',
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

jest.mock('@/components/admin/input-groups/multi-select-input-group/MultiSelectInputGroup', () => ({
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

            <button type="button" data-testid={`select-${id}`} onClick={() => onChange && onChange([options[0]])}>
                {value?.map((v) => v.name).join(', ')}
            </button>

            <button type="button" data-testid={`blur-${id}`} onClick={onBlur}>
                Blur
            </button>
            {error && <span data-testid={`error-${id}`}>{error}</span>}
        </div>
    ),
}));
jest.mock('@/components/admin/input-groups/photo-input-group/PhotoInputGroup', () => ({
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

jest.mock('@/components/admin/button/Button', () => ({
    Button: ({ children, onClick, disabled, ...rest }: ButtonProps & { 'data-testid'?: string }) => (
        <button type="button" onClick={onClick} disabled={disabled} data-testid={rest['data-testid'] ?? 'button'}>
            {children}
        </button>
    ),
}));

jest.mock('@/assets/icons/plus.svg', () => ({
    ReactComponent: () => <svg>PlusIcon</svg>,
}));

jest.mock('../program-section-form/ProgramSectionForm', () => ({
    ProgramSectionForm: ({ section, onSave, onCancel, isDisabled }: any) => (
        <div
            data-testid="program-section-form"
            data-section-template={String(section.template)}
            data-disabled={String(isDisabled)}
        >
            <button type="button" data-testid={`save-section-${section.id ?? section.template}`} onClick={onSave}>
                Save
            </button>
            <button type="button" data-testid={`cancel-section-${section.id ?? section.template}`} onClick={onCancel}>
                Cancel
            </button>
        </div>
    ),
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

    describe('Rendering and Initialization', () => {
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
                sections: [],
            };

            renderProgramForm({ initialData });

            expect(screen.getByTestId('input-name')).toHaveValue('Initial Name');
            expect(screen.getByTestId('input-location')).toHaveValue('Kyiv');
            expect(screen.getByTestId('input-participantsCount')).toHaveValue('10');
            expect(screen.getByTestId('input-meetingCount')).toHaveValue('5');
            expect(screen.getByTestId('input-description')).toHaveValue('Initial Desc');
            expect(screen.getByTestId('value-backgroundImage')).toHaveTextContent('HasImage');
            expect(screen.getByTestId('value-previewImage')).toHaveTextContent('HasImage');
        });

        it('should call onAddSection when the add button is clicked', () => {
            renderProgramForm();
            fireEvent.click(screen.getByTestId('add-program-button'));
            expect(mockOnAddSection).toHaveBeenCalled();
        });

        it('should call onAddSection from empty sections state button', () => {
            renderProgramForm();
            fireEvent.click(screen.getByTestId('add-section-button-empty'));
            expect(mockOnAddSection).toHaveBeenCalled();
        });
    });

    describe('Field Interactions and Validation Wiring', () => {
        it('should handle name input changes and blur validation', () => {
            (PROGRAM_VALIDATION_FUNCTIONS.validateName as jest.Mock).mockReturnValue('Name Error');
            renderProgramForm();

            const input = screen.getByTestId('input-name');
            fireEvent.change(input, { target: { value: 'New Name' } });
            fireEvent.blur(input);

            expect(input).toHaveValue('New Name');
            expect(PROGRAM_VALIDATION_FUNCTIONS.validateName).toHaveBeenCalled();
            expect(screen.getByTestId('error-name')).toHaveTextContent('Name Error');
        });

        it('should handle location input changes and blur validation', () => {
            (PROGRAM_VALIDATION_FUNCTIONS.validateLocation as jest.Mock).mockReturnValue('Location Error');
            renderProgramForm();

            const input = screen.getByTestId('input-location');
            fireEvent.change(input, { target: { value: 'Lviv' } });
            fireEvent.blur(input);

            expect(input).toHaveValue('Lviv');
            expect(PROGRAM_VALIDATION_FUNCTIONS.validateLocation).toHaveBeenCalled();
            expect(screen.getByTestId('error-location')).toHaveTextContent('Location Error');
        });

        it('should handle participants count input changes and blur validation', () => {
            (PROGRAM_VALIDATION_FUNCTIONS.validateParticipantsCount as jest.Mock).mockReturnValue('Count Error');
            renderProgramForm();

            const input = screen.getByTestId('input-participantsCount');
            fireEvent.change(input, { target: { value: '100' } });
            fireEvent.blur(input);

            expect(input).toHaveValue('100');
            expect(PROGRAM_VALIDATION_FUNCTIONS.validateParticipantsCount).toHaveBeenCalled();
            expect(screen.getByTestId('error-participantsCount')).toHaveTextContent('Count Error');
        });

        it('should handle meeting count input changes and blur validation', () => {
            (PROGRAM_VALIDATION_FUNCTIONS.validateMeetingCount as jest.Mock).mockReturnValue('Meeting Error');
            renderProgramForm();

            const input = screen.getByTestId('input-meetingCount');
            fireEvent.change(input, { target: { value: '5' } });
            fireEvent.blur(input);

            expect(input).toHaveValue('5');
            expect(PROGRAM_VALIDATION_FUNCTIONS.validateMeetingCount).toHaveBeenCalled();
            expect(screen.getByTestId('error-meetingCount')).toHaveTextContent('Meeting Error');
        });

        it('should handle description input changes and blur validation', () => {
            (PROGRAM_VALIDATION_FUNCTIONS.validateDescription as jest.Mock).mockReturnValue('Description Error');
            renderProgramForm();

            const input = screen.getByTestId('input-description');
            fireEvent.change(input, { target: { value: 'Detailed desc' } });
            fireEvent.blur(input);

            expect(input).toHaveValue('Detailed desc');
            expect(PROGRAM_VALIDATION_FUNCTIONS.validateDescription).toHaveBeenCalled();
            expect(screen.getByTestId('error-description')).toHaveTextContent('Description Error');
        });

        it('should handle categories changes and blur validation', () => {
            (PROGRAM_VALIDATION_FUNCTIONS.validateCategories as jest.Mock).mockReturnValue('Category Error');
            renderProgramForm();

            const selectDiv = screen.getByTestId('select-toolbar-categories');
            fireEvent.click(selectDiv);
            fireEvent.click(screen.getByTestId('blur-toolbar-categories'));

            expect(selectDiv).toHaveTextContent('Tech');
            expect(PROGRAM_VALIDATION_FUNCTIONS.validateCategories).toHaveBeenCalled();
            expect(screen.getByTestId('error-toolbar-categories')).toHaveTextContent('Category Error');
        });
    });

    describe('Image Handling', () => {
        it('should handle background image upload and validation', () => {
            (PROGRAM_VALIDATION_FUNCTIONS.validateBackgroundImage as jest.Mock).mockReturnValue('Bg Error');
            renderProgramForm();

            fireEvent.click(screen.getByTestId('upload-backgroundImage'));

            expect(screen.getByTestId('value-backgroundImage')).toHaveTextContent('HasImage');
            expect(PROGRAM_VALIDATION_FUNCTIONS.validateBackgroundImage).toHaveBeenCalled();
            expect(screen.getByTestId('error-backgroundImage')).toHaveTextContent('Bg Error');
        });

        it('should handle background image manual error setting', () => {
            renderProgramForm();
            fireEvent.click(screen.getByTestId('error-trigger-backgroundImage'));
            expect(screen.getByTestId('error-backgroundImage')).toHaveTextContent('Manual Error');
        });

        it('should handle preview image upload and validation', () => {
            (PROGRAM_VALIDATION_FUNCTIONS.validatePreviewImage as jest.Mock).mockReturnValue('Preview Error');
            renderProgramForm();

            fireEvent.click(screen.getByTestId('upload-previewImage'));

            expect(screen.getByTestId('value-previewImage')).toHaveTextContent('HasImage');
            expect(PROGRAM_VALIDATION_FUNCTIONS.validatePreviewImage).toHaveBeenCalled();
            expect(screen.getByTestId('error-previewImage')).toHaveTextContent('Preview Error');
        });

        it('should handle preview image manual error setting', () => {
            renderProgramForm();
            fireEvent.click(screen.getByTestId('error-trigger-previewImage'));
            expect(screen.getByTestId('error-previewImage')).toHaveTextContent('Manual Error');
        });
    });

    describe('Form Submission & Ref Methods', () => {
        it('should return true for isDirty when form differs from initial data', () => {
            const ref = React.createRef<ProgramFormRef>();
            renderProgramForm({}, ref);

            expect(ref.current?.isDirty()).toBe(false);
        });

        it('should return false for isDirty when form differs from initial data', () => {
            const ref = React.createRef<ProgramFormRef>();
            const initialData: ProgramFormValues = {
                name: 'Test Program',
                categories: [],
                description: 'Test',
                previewImage: null,
                previewImageId: null,
                backgroundImage: null,
                backgroundImageId: null,
                location: 'Kyiv',
                participantsCount: '10',
                meetingCount: '5',
                sections: [],
            };
            renderProgramForm({ initialData }, ref);

            expect(ref.current?.isDirty()).toBe(false);
        });

        it('should return false for isValid if validation fails', () => {
            const ref = React.createRef<ProgramFormRef>();
            renderProgramForm({}, ref);
            (PROGRAM_VALIDATION_FUNCTIONS.validateName as jest.Mock).mockReturnValue('Error');
            expect(ref.current?.isValid(false)).toBe(false);
        });

        it('should return true for isValid if validation passes', () => {
            const ref = React.createRef<ProgramFormRef>();
            renderProgramForm({}, ref);
            Object.values(PROGRAM_VALIDATION_FUNCTIONS).forEach((fn) => (fn as jest.Mock).mockReturnValue(undefined));
            expect(ref.current?.isValid(false)).toBe(true);
        });

        it('should submit form when valid and call validateForm for all fields', async () => {
            const ref = React.createRef<ProgramFormRef>();
            const initialData: ProgramFormValues = {
                name: 'Program A',
                categories: [],
                description: 'Test description',
                previewImage: null,
                previewImageId: null,
                backgroundImage: null,
                backgroundImageId: null,
                location: 'Kyiv',
                participantsCount: '10',
                meetingCount: '5',
                sections: [],
            };
            renderProgramForm({ initialData }, ref);

            Object.values(PROGRAM_VALIDATION_FUNCTIONS).forEach((fn) => (fn as jest.Mock).mockReturnValue(undefined));

            await waitFor(() => {
                expect(screen.getByTestId('input-name')).toHaveValue('Program A');
            });

            await act(async () => {
                await ref.current?.submit(VisibilityStatus.Published);
            });

            expect(PROGRAM_VALIDATION_FUNCTIONS.validateName).toHaveBeenCalled();
            expect(PROGRAM_VALIDATION_FUNCTIONS.validateCategories).toHaveBeenCalled();
            expect(PROGRAM_VALIDATION_FUNCTIONS.validateDescription).toHaveBeenCalled();
            expect(PROGRAM_VALIDATION_FUNCTIONS.validatePreviewImage).toHaveBeenCalled();
            expect(PROGRAM_VALIDATION_FUNCTIONS.validateBackgroundImage).toHaveBeenCalled();
            expect(PROGRAM_VALIDATION_FUNCTIONS.validateLocation).toHaveBeenCalled();
            expect(PROGRAM_VALIDATION_FUNCTIONS.validateParticipantsCount).toHaveBeenCalled();
            expect(PROGRAM_VALIDATION_FUNCTIONS.validateMeetingCount).toHaveBeenCalled();

            expect(mockOnSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Program A',
                    location: 'Kyiv',
                    participantsCount: '10',
                    meetingCount: '5',
                }),
                VisibilityStatus.Published,
            );
        });

        it('should NOT submit form when validation fails', async () => {
            const ref = React.createRef<ProgramFormRef>();
            renderProgramForm({}, ref);

            (PROGRAM_VALIDATION_FUNCTIONS.validateName as jest.Mock).mockReturnValue('Required');

            await act(async () => {
                await ref.current?.submit(VisibilityStatus.Published);
            });

            expect(mockOnSubmit).not.toHaveBeenCalled();
            expect(screen.getByTestId('error-name')).toHaveTextContent('Required');
        });
    });

    describe('Sections handling (branches)', () => {
        const sectionWithId: ProgramSection = {
            id: 101,
            template: 'dual-images-bottom' as any,
            order: 0,
            contents: [],
        } as ProgramSection;

        const sectionWithoutId: ProgramSection = {
            id: undefined,
            template: 'images-bottom' as any,
            order: 1,
            contents: [],
        } as ProgramSection;

        it('renders empty state when there are no sections, and sections list when sections exist', async () => {
            const ref = React.createRef<ProgramFormRef>();
            renderProgramForm({}, ref);

            expect(screen.queryAllByTestId('program-section-form')).toHaveLength(0);
            expect(screen.getByTestId('add-section-button-empty')).toBeInTheDocument();

            await act(async () => {
                ref.current?.addSection(sectionWithId);
            });

            await waitFor(() => {
                expect(screen.getAllByTestId('program-section-form')).toHaveLength(1);
            });
            expect(screen.queryByTestId('add-section-button-empty')).not.toBeInTheDocument();
        });

        it('supports addSection/removeSection/getSections via ref (and covers key id ?? template)', async () => {
            const ref = React.createRef<ProgramFormRef>();
            const initialData: ProgramFormValues = {
                name: '',
                categories: [],
                description: '',
                previewImage: null,
                previewImageId: null,
                backgroundImage: null,
                backgroundImageId: null,
                location: '',
                participantsCount: '',
                meetingCount: '',
                sections: [sectionWithId, sectionWithoutId],
            };

            renderProgramForm({ initialData }, ref);

            await waitFor(() => {
                expect(screen.getAllByTestId('program-section-form')).toHaveLength(2);
            });

            expect(ref.current?.getSections()).toHaveLength(2);

            const newSection: ProgramSection = {
                id: 202,
                template: 'quad-images-bottom' as any,
                order: 2,
                contents: [],
            } as ProgramSection;
            await act(async () => {
                ref.current?.addSection(newSection);
            });

            await waitFor(() => {
                expect(screen.getAllByTestId('program-section-form')).toHaveLength(3);
            });
            expect(ref.current?.getSections()?.[0]).toMatchObject({ id: 202 });

            await act(async () => {
                ref.current?.removeSection(1);
            });

            await waitFor(() => {
                expect(screen.getAllByTestId('program-section-form')).toHaveLength(2);
            });
            expect(ref.current?.getSections()).toHaveLength(2);
        });

        it('calls onRequestCancelSection when section cancel is requested', async () => {
            const onRequestCancelSection = jest.fn();
            const initialData: ProgramFormValues = {
                name: '',
                categories: [],
                description: '',
                previewImage: null,
                previewImageId: null,
                backgroundImage: null,
                backgroundImageId: null,
                location: '',
                participantsCount: '',
                meetingCount: '',
                sections: [sectionWithId],
            };

            renderProgramForm({ initialData, onRequestCancelSection });

            await waitFor(() => {
                expect(screen.getAllByTestId('program-section-form')).toHaveLength(1);
            });

            fireEvent.click(screen.getByTestId('cancel-section-101'));
            expect(onRequestCancelSection).toHaveBeenCalledWith(0);
        });

        it('does not throw if onRequestCancelSection is not provided', async () => {
            const initialData: ProgramFormValues = {
                name: '',
                categories: [],
                description: '',
                previewImage: null,
                previewImageId: null,
                backgroundImage: null,
                backgroundImageId: null,
                location: '',
                participantsCount: '',
                meetingCount: '',
                sections: [sectionWithId],
            };

            renderProgramForm({ initialData });
            await waitFor(() => {
                expect(screen.getAllByTestId('program-section-form')).toHaveLength(1);
            });

            expect(() => fireEvent.click(screen.getByTestId('cancel-section-101'))).not.toThrow();
        });

        it('wires ProgramSectionForm isDisabled based on isFormDisabled', async () => {
            const initialData: ProgramFormValues = {
                name: '',
                categories: [],
                description: '',
                previewImage: null,
                previewImageId: null,
                backgroundImage: null,
                backgroundImageId: null,
                location: '',
                participantsCount: '',
                meetingCount: '',
                sections: [sectionWithId],
            };

            renderProgramForm({ initialData, isFormDisabled: true });
            await waitFor(() => {
                const section = screen.getByTestId('program-section-form') as HTMLElement;
                expect(section.dataset.disabled).toBe('true');
            });
        });

        it('triggers handleSaveSection via ProgramSectionForm onSave', async () => {
            const initialData: ProgramFormValues = {
                name: '',
                categories: [],
                description: '',
                previewImage: null,
                previewImageId: null,
                backgroundImage: null,
                backgroundImageId: null,
                location: '',
                participantsCount: '',
                meetingCount: '',
                sections: [sectionWithId],
            };

            renderProgramForm({ initialData });
            await waitFor(() => {
                expect(screen.getAllByTestId('program-section-form')).toHaveLength(1);
            });

            fireEvent.click(screen.getByTestId('save-section-101'));
            expect(screen.getAllByTestId('program-section-form')).toHaveLength(1);
        });
    });
});
