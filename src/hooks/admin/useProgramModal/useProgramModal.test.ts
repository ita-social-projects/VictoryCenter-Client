import { renderHook, act } from '@testing-library/react';
import { useProgramModal } from './useProgramModal';
import { ProgramsApi } from '../../../services/api/admin/programs/programs-api';
import { PROGRAMS_TEXT } from '../../../const/admin/programs';
import { ProgramFormValues } from '../../../pages/admin/programs/components/program-form/ProgramForm';
import { Program } from '../../../types/admin/programs';
import { VisibilityStatus } from '../../../types/common';

jest.mock('../../../services/api/admin/programs/programs-api');
jest.mock('../../../const/admin/programs');

const mockProgramsApi = ProgramsApi as jest.Mocked<typeof ProgramsApi>;
const mockProgramsText = PROGRAMS_TEXT as jest.Mocked<typeof PROGRAMS_TEXT>;

const mockProgram: Program = {
    id: 1,
    name: 'Test Program',
    description: 'Test Description',
    categories: [
        { id: 1, name: 'Category 1', programsCount: 5 },
        { id: 2, name: 'Category 2', programsCount: 3 },
    ],
    status: 'Draft' as VisibilityStatus,
    img: 'test-image.jpg',
};

const mockFormData: ProgramFormValues = {
    name: 'New Program',
    description: 'New Description',
    categories: [{ id: 1, name: 'Category 1', programsCount: 5 }],
    img: new File([''], 'test.jpg', { type: 'image/jpeg' }),
};

const mockFormRef = {
    current: {
        submit: jest.fn(),
        isDirty: false,
    },
};

const defaultProps = {
    isOpen: true,
    onSuccess: jest.fn(),
    onClose: jest.fn(),
};

describe('useProgramModal - Add Mode', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockProgramsText.FORM.MESSAGE.FAIL_TO_CREATE_PROGRAM = 'Failed to create program';
        mockProgramsText.FORM.MESSAGE.FAIL_TO_UPDATE_PROGRAM = 'Failed to update program';
    });

    it('should initialize in add mode when no program is provided', () => {
        const { result } = renderHook(() => useProgramModal({ ...defaultProps, program: null }));

        expect(result.current.initialData).toBeNull();
        expect(result.current.isSubmitting).toBe(false);
        expect(result.current.error).toBe('');
        expect(result.current.pendingAction).toBeNull();
        expect(result.current.modals.formConfirm.isOpen).toBe(false);
        expect(result.current.modals.closeConfirm.isOpen).toBe(false);
    });

    it('should handle form submission for creating new program as draft', async () => {
        mockProgramsApi.addProgram.mockResolvedValue(mockProgram);
        const onSuccess = jest.fn();

        const { result } = renderHook(() => useProgramModal({ ...defaultProps, program: null, onSuccess }));

        // Submit form as draft
        act(() => {
            result.current.handleFormSubmit(mockFormData, 'Draft');
        });

        expect(result.current.modals.formConfirm.isOpen).toBe(true);
        expect(result.current.pendingAction).toBe('draft');

        // Confirm the action
        await act(async () => {
            await result.current.modals.formConfirm.onConfirm();
        });

        expect(mockProgramsApi.addProgram).toHaveBeenCalledWith({
            id: null,
            name: mockFormData.name,
            description: mockFormData.description,
            categoryIds: [1],
            img: mockFormData.img,
            status: 'Draft',
        });
        expect(onSuccess).toHaveBeenCalledWith(mockProgram);
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should handle form submission for creating new program as published', async () => {
        mockProgramsApi.addProgram.mockResolvedValue(mockProgram);
        const onSuccess = jest.fn();

        const { result } = renderHook(() => useProgramModal({ ...defaultProps, program: null, onSuccess }));

        // Submit form as published
        act(() => {
            result.current.handleFormSubmit(mockFormData, 'Published');
        });

        expect(result.current.pendingAction).toBe('publish');

        // Confirm the action
        await act(async () => {
            await result.current.modals.formConfirm.onConfirm();
        });

        expect(mockProgramsApi.addProgram).toHaveBeenCalledWith(
            expect.objectContaining({
                status: 'Published',
            }),
        );
    });

    it('should handle API error during program creation', async () => {
        mockProgramsApi.addProgram.mockRejectedValue(new Error('API Error'));

        const { result } = renderHook(() => useProgramModal({ ...defaultProps, program: null }));

        act(() => {
            result.current.handleFormSubmit(mockFormData, 'Draft');
        });

        await act(async () => {
            await result.current.modals.formConfirm.onConfirm();
        });

        expect(result.current.error).toBe('Failed to create program');
        expect(result.current.isSubmitting).toBe(false);
        expect(defaultProps.onSuccess).not.toHaveBeenCalled();
        expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    it('should handle form confirmation cancellation in add mode', () => {
        const { result } = renderHook(() => useProgramModal({ ...defaultProps, program: null }));

        // Submit form
        act(() => {
            result.current.handleFormSubmit(mockFormData, 'Draft');
        });

        expect(result.current.modals.formConfirm.isOpen).toBe(true);

        // Cancel confirmation
        act(() => {
            result.current.modals.formConfirm.onCancel();
        });

        expect(result.current.modals.formConfirm.isOpen).toBe(false);
        expect(result.current.pendingAction).toBeNull();
        expect(result.current.isSubmitting).toBe(false);
    });
});

describe('useProgramModal - Edit Mode', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockProgramsText.FORM.MESSAGE.FAIL_TO_CREATE_PROGRAM = 'Failed to create program';
        mockProgramsText.FORM.MESSAGE.FAIL_TO_UPDATE_PROGRAM = 'Failed to update program';
    });

    it('should initialize in edit mode with program data', () => {
        const { result } = renderHook(() => useProgramModal({ ...defaultProps, program: mockProgram }));

        expect(result.current.initialData).toEqual({
            name: mockProgram.name,
            description: mockProgram.description,
            categories: mockProgram.categories,
            img: mockProgram.img,
        });
    });

    it('should handle form submission for updating existing program', async () => {
        const updatedProgram = { ...mockProgram, name: 'Updated Program' };
        mockProgramsApi.editProgram.mockResolvedValue(updatedProgram);
        const onSuccess = jest.fn();

        const { result } = renderHook(() => useProgramModal({ ...defaultProps, program: mockProgram, onSuccess }));

        const updatedFormData = { ...mockFormData, name: 'Updated Program' };

        // Submit form
        act(() => {
            result.current.handleFormSubmit(updatedFormData, 'Published');
        });

        // Confirm the action
        await act(async () => {
            await result.current.modals.formConfirm.onConfirm();
        });

        expect(mockProgramsApi.editProgram).toHaveBeenCalledWith({
            id: mockProgram.id,
            name: updatedFormData.name,
            description: updatedFormData.description,
            categoryIds: [1],
            img: updatedFormData.img,
            status: 'Published',
        });
        expect(onSuccess).toHaveBeenCalledWith(updatedProgram);
    });

    it('should handle API error during program update', async () => {
        mockProgramsApi.editProgram.mockRejectedValue(new Error('Update failed'));

        const { result } = renderHook(() => useProgramModal({ ...defaultProps, program: mockProgram }));

        act(() => {
            result.current.handleFormSubmit(mockFormData, 'Draft');
        });

        await act(async () => {
            await result.current.modals.formConfirm.onConfirm();
        });

        expect(result.current.error).toBe('Failed to update program');
        expect(result.current.isSubmitting).toBe(false);
    });

    it('should show close confirmation when form is dirty', () => {
        const { result } = renderHook(() => useProgramModal({ ...defaultProps, program: mockProgram }));

        // Mock form as dirty
        result.current.formRef.current = { ...mockFormRef.current, isDirty: true };

        act(() => {
            result.current.handleClose();
        });

        expect(result.current.modals.closeConfirm.isOpen).toBe(true);
        expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    it('should handle close confirmation and cancellation', () => {
        const { result } = renderHook(() => useProgramModal({ ...defaultProps, program: mockProgram }));

        // Mock form as dirty and trigger close
        result.current.formRef.current = { ...mockFormRef.current, isDirty: true };

        act(() => {
            result.current.handleClose();
        });

        expect(result.current.modals.closeConfirm.isOpen).toBe(true);

        // Confirm close
        act(() => {
            result.current.modals.closeConfirm.onConfirm();
        });

        expect(result.current.modals.closeConfirm.isOpen).toBe(false);
        expect(defaultProps.onClose).toHaveBeenCalled();

        // Reset for cancel test
        jest.clearAllMocks();

        act(() => {
            result.current.handleClose();
        });

        // Cancel close
        act(() => {
            result.current.modals.closeConfirm.onCancel();
        });

        expect(result.current.modals.closeConfirm.isOpen).toBe(false);
        expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
});
