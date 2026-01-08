import { renderHook, act } from '@testing-library/react';
import { useProgramSectionValidation } from './useProgramSectionValidation';
import { PROGRAM_SECTION_VALIDATION } from '@/const/admin/programs';

const createChangeEvent = (value: string) =>
    ({
        target: { value },
    }) as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;

const createBlurEvent = (value: string) =>
    ({
        target: { value },
    }) as React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>;

const createTextAreaChangeEvent = (value: string) =>
    ({
        target: { value },
    }) as React.ChangeEvent<HTMLTextAreaElement>;

const createTextAreaBlurEvent = (value: string) =>
    ({
        target: { value },
    }) as React.FocusEvent<HTMLTextAreaElement>;

describe('useProgramSectionValidation', () => {
    describe('title validation', () => {
        it('should not show error initially', () => {
            const { result } = renderHook(() => useProgramSectionValidation({}));
            expect(result.current.titleError).toBeUndefined();
        });

        it.each([
            ['too short', 'abc'],
            ['empty', ''],
            ['whitespace-only', '     '],
        ])('should show error on blur when title is %s', (_, value) => {
            const { result } = renderHook(() => useProgramSectionValidation({}));

            act(() => {
                result.current.handleTitleBlur(createBlurEvent(value));
            });

            expect(result.current.titleError).toBeDefined();
        });

        it('should not show error when title meets minimum length', () => {
            const { result } = renderHook(() => useProgramSectionValidation({}));
            const validTitle = 'a'.repeat(PROGRAM_SECTION_VALIDATION.title.min);

            act(() => {
                result.current.handleTitleBlur(createBlurEvent(validTitle));
            });

            expect(result.current.titleError).toBeUndefined();
        });

        it('should trim spaces on blur', () => {
            const onTitleChange = jest.fn();
            const { result } = renderHook(() => useProgramSectionValidation({ onTitleChange }));

            act(() => {
                result.current.handleTitleBlur(createBlurEvent('  Valid Title  '));
            });

            expect(onTitleChange).toHaveBeenCalledWith('Valid Title');
        });

        it('should clear error while typing when value becomes valid', () => {
            const { result } = renderHook(() => useProgramSectionValidation({}));

            act(() => {
                result.current.handleTitleBlur(createBlurEvent('abc'));
            });
            expect(result.current.titleError).toBeDefined();

            act(() => {
                result.current.handleTitleChange(createChangeEvent('Valid Title'));
            });
            expect(result.current.titleError).toBeUndefined();
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
                result.current.handleDescriptionBlur(createTextAreaBlurEvent('short'));
            });

            expect(result.current.descriptionError).toBeDefined();
        });

        it('should not show error when description meets minimum length', () => {
            const { result } = renderHook(() => useProgramSectionValidation({}));
            const validDescription = 'a'.repeat(PROGRAM_SECTION_VALIDATION.description.min);

            act(() => {
                result.current.handleDescriptionBlur(createTextAreaBlurEvent(validDescription));
            });

            expect(result.current.descriptionError).toBeUndefined();
        });

        it('should trim spaces on blur', () => {
            const onDescriptionChange = jest.fn();
            const { result } = renderHook(() => useProgramSectionValidation({ onDescriptionChange }));

            act(() => {
                result.current.handleDescriptionBlur(createTextAreaBlurEvent('  Valid description here  '));
            });

            expect(onDescriptionChange).toHaveBeenCalledWith('Valid description here');
        });

        it('should clear error while typing when value becomes valid', () => {
            const { result } = renderHook(() => useProgramSectionValidation({}));

            act(() => {
                result.current.handleDescriptionBlur(createTextAreaBlurEvent('short'));
            });
            expect(result.current.descriptionError).toBeDefined();

            act(() => {
                result.current.handleDescriptionChange(
                    createTextAreaChangeEvent('This is a valid description with enough characters'),
                );
            });
            expect(result.current.descriptionError).toBeUndefined();
        });
    });

    describe('callback props', () => {
        it('should call onTitleChange when title changes', () => {
            const onTitleChange = jest.fn();
            const { result } = renderHook(() => useProgramSectionValidation({ onTitleChange }));

            act(() => {
                result.current.handleTitleChange(createChangeEvent('New Title'));
            });

            expect(onTitleChange).toHaveBeenCalledWith('New Title');
        });

        it('should call onDescriptionChange when description changes', () => {
            const onDescriptionChange = jest.fn();
            const { result } = renderHook(() => useProgramSectionValidation({ onDescriptionChange }));

            act(() => {
                result.current.handleDescriptionChange(createTextAreaChangeEvent('New Description'));
            });

            expect(onDescriptionChange).toHaveBeenCalledWith('New Description');
        });

        it('should work without callback props', () => {
            const { result } = renderHook(() => useProgramSectionValidation({}));

            expect(() => {
                act(() => {
                    result.current.handleTitleChange(createChangeEvent('Title'));
                });
            }).not.toThrow();
        });
    });
});
