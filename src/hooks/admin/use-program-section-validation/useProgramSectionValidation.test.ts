import { renderHook, act } from '@testing-library/react';
import { useProgramSectionValidation } from './useProgramSectionValidation';
import { PROGRAM_SECTION_VALIDATION } from '@/const/admin/programs';

describe('useProgramSectionValidation', () => {
    describe('title validation', () => {
        it('should not show error initially', () => {
            const { result } = renderHook(() => useProgramSectionValidation({}));

            expect(result.current.titleError).toBeUndefined();
        });

        it('should show error on blur when title is too short', () => {
            const { result } = renderHook(() => useProgramSectionValidation({}));

            act(() => {
                result.current.handleTitleBlur({
                    target: { value: 'abc' },
                } as React.FocusEvent<HTMLInputElement>);
            });

            expect(result.current.titleError).toBeDefined();
        });

        it('should show error on blur when title is empty', () => {
            const { result } = renderHook(() => useProgramSectionValidation({}));

            act(() => {
                result.current.handleTitleBlur({
                    target: { value: '' },
                } as React.FocusEvent<HTMLInputElement>);
            });

            expect(result.current.titleError).toBeDefined();
        });

        it('should not show error when title meets minimum length', () => {
            const { result } = renderHook(() => useProgramSectionValidation({}));
            const validTitle = 'a'.repeat(PROGRAM_SECTION_VALIDATION.title.min);

            act(() => {
                result.current.handleTitleBlur({
                    target: { value: validTitle },
                } as React.FocusEvent<HTMLInputElement>);
            });

            expect(result.current.titleError).toBeUndefined();
        });

        it('should trim spaces on blur', () => {
            const onTitleChange = jest.fn();
            const { result } = renderHook(() => useProgramSectionValidation({ onTitleChange }));

            act(() => {
                result.current.handleTitleBlur({
                    target: { value: '  Valid Title  ' },
                } as React.FocusEvent<HTMLInputElement>);
            });

            expect(onTitleChange).toHaveBeenCalledWith('Valid Title');
        });

        it('should clear error while typing when value becomes valid', () => {
            const { result } = renderHook(() => useProgramSectionValidation({}));

            act(() => {
                result.current.handleTitleBlur({
                    target: { value: 'abc' },
                } as React.FocusEvent<HTMLInputElement>);
            });

            expect(result.current.titleError).toBeDefined();

            act(() => {
                result.current.handleTitleChange({
                    target: { value: 'Valid Title' },
                } as React.ChangeEvent<HTMLInputElement>);
            });

            expect(result.current.titleError).toBeUndefined();
        });

        it('should treat whitespace-only input as empty', () => {
            const { result } = renderHook(() => useProgramSectionValidation({}));

            act(() => {
                result.current.handleTitleBlur({
                    target: { value: '     ' },
                } as React.FocusEvent<HTMLInputElement>);
            });

            expect(result.current.titleError).toBeDefined();
        });
    });

    describe('description validation', () => {
        it('should not show error initially', () => {
            const { result } = renderHook(() => useProgramSectionValidation({}));

            expect(result.current.descriptionError).toBeUndefined();
        });

        it('should show error on blur when description is too short', () => {
            const { result } = renderHook(() => useProgramSectionValidation({}));

            act(() => {
                result.current.handleDescriptionBlur({
                    target: { value: 'short' },
                } as React.FocusEvent<HTMLTextAreaElement>);
            });

            expect(result.current.descriptionError).toBeDefined();
        });

        it('should not show error when description meets minimum length', () => {
            const { result } = renderHook(() => useProgramSectionValidation({}));
            const validDescription = 'a'.repeat(PROGRAM_SECTION_VALIDATION.description.min);

            act(() => {
                result.current.handleDescriptionBlur({
                    target: { value: validDescription },
                } as React.FocusEvent<HTMLTextAreaElement>);
            });

            expect(result.current.descriptionError).toBeUndefined();
        });

        it('should trim spaces on blur', () => {
            const onDescriptionChange = jest.fn();
            const { result } = renderHook(() => useProgramSectionValidation({ onDescriptionChange }));

            act(() => {
                result.current.handleDescriptionBlur({
                    target: { value: '  Valid description here  ' },
                } as React.FocusEvent<HTMLTextAreaElement>);
            });

            expect(onDescriptionChange).toHaveBeenCalledWith('Valid description here');
        });

        it('should clear error while typing when value becomes valid', () => {
            const { result } = renderHook(() => useProgramSectionValidation({}));

            act(() => {
                result.current.handleDescriptionBlur({
                    target: { value: 'short' },
                } as React.FocusEvent<HTMLTextAreaElement>);
            });

            expect(result.current.descriptionError).toBeDefined();

            act(() => {
                result.current.handleDescriptionChange({
                    target: { value: 'This is a valid description with enough characters' },
                } as React.ChangeEvent<HTMLTextAreaElement>);
            });

            expect(result.current.descriptionError).toBeUndefined();
        });
    });

    describe('callback props', () => {
        it('should call onTitleChange when title changes', () => {
            const onTitleChange = jest.fn();
            const { result } = renderHook(() => useProgramSectionValidation({ onTitleChange }));

            act(() => {
                result.current.handleTitleChange({
                    target: { value: 'New Title' },
                } as React.ChangeEvent<HTMLInputElement>);
            });

            expect(onTitleChange).toHaveBeenCalledWith('New Title');
        });

        it('should call onDescriptionChange when description changes', () => {
            const onDescriptionChange = jest.fn();
            const { result } = renderHook(() => useProgramSectionValidation({ onDescriptionChange }));

            act(() => {
                result.current.handleDescriptionChange({
                    target: { value: 'New Description' },
                } as React.ChangeEvent<HTMLTextAreaElement>);
            });

            expect(onDescriptionChange).toHaveBeenCalledWith('New Description');
        });

        it('should work without callback props', () => {
            const { result } = renderHook(() => useProgramSectionValidation({}));

            expect(() => {
                act(() => {
                    result.current.handleTitleChange({
                        target: { value: 'Title' },
                    } as React.ChangeEvent<HTMLInputElement>);
                });
            }).not.toThrow();
        });
    });
});
