import { renderHook, act } from '@testing-library/react';
import type React from 'react';

import { useProgramSectionValidation } from './useProgramSectionValidation';

import { PROGRAM_SECTION_TEMPLATE_VALIDATION, PROGRAM_SECTION_VALIDATION } from '@/const/admin/programs';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { ProgramSectionTemplate } from '@/types/common/program-sections';
import { ContentType } from '@/types/common/programs';
import { PROGRAM_SECTION_VALIDATION_FUNCTIONS } from '@/validation/admin/program-schema/program-schema';

const TEMPLATE = ProgramSectionTemplate.SingleTitleDescriptionAuthorPairs;

const titleReq = (PROGRAM_SECTION_TEMPLATE_VALIDATION as any)[TEMPLATE].lengths[ContentType.Title] as {
    min: number;
    max: number;
};

const descriptionReq = (PROGRAM_SECTION_TEMPLATE_VALIDATION as any)[TEMPLATE].lengths[ContentType.Description] as {
    min: number;
    max: number;
};

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
            const { result } = renderHook(() => useProgramSectionValidation({ template: TEMPLATE }));
            expect(result.current.titleError).toBeUndefined();
        });

        it.each([
            ['empty', ''],
            ['whitespace-only', '     '],
        ])('should show required error on blur when title is %s', (_, value) => {
            const { result } = renderHook(() => useProgramSectionValidation({ template: TEMPLATE }));

            act(() => {
                result.current.handleTitleBlur(createBlurEvent(value));
            });

            expect(result.current.titleError).toBe(PROGRAM_SECTION_VALIDATION.title.getRequiredError());
        });

        it('should not show error when title is valid (draft)', () => {
            const { result } = renderHook(() => useProgramSectionValidation({ template: TEMPLATE }));
            const validTitle = 'a'.repeat(titleReq.min);

            act(() => {
                result.current.handleTitleBlur(createBlurEvent(validTitle));
            });

            expect(result.current.titleError).toBeUndefined();
        });

        it('should show max error when title exceeds max (draft)', () => {
            const { result } = renderHook(() => useProgramSectionValidation({ template: TEMPLATE }));
            const tooLong = 'a'.repeat(titleReq.max + 1);

            act(() => {
                result.current.handleTitleBlur(createBlurEvent(tooLong));
            });

            expect(result.current.titleError).toBe(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(titleReq.max));
        });

        it('should show min error when title is too short in publishing mode', () => {
            const { result } = renderHook(() =>
                useProgramSectionValidation({ template: TEMPLATE, isPublishing: true }),
            );

            const tooShort = 'a'.repeat(Math.max(0, titleReq.min - 1));

            act(() => {
                result.current.handleTitleBlur(createBlurEvent(tooShort));
            });

            expect(result.current.titleError).toBe(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(titleReq.min));
        });

        it('should trim spaces on blur', () => {
            const onTitleChange = jest.fn();
            const { result } = renderHook(() => useProgramSectionValidation({ template: TEMPLATE, onTitleChange }));

            act(() => {
                result.current.handleTitleBlur(createBlurEvent('  Valid Title  '));
            });

            expect(onTitleChange).toHaveBeenCalledWith('Valid Title');
        });

        it('should not validate on change when there is no error', () => {
            const spy = jest.spyOn(PROGRAM_SECTION_VALIDATION_FUNCTIONS, 'validateSectionTitle');

            const { result } = renderHook(() => useProgramSectionValidation({ template: TEMPLATE }));

            act(() => {
                result.current.handleTitleChange(createChangeEvent('Some Title'));
            });

            expect(result.current.titleError).toBeUndefined();
            expect(spy).not.toHaveBeenCalled();

            spy.mockRestore();
        });

        it('should clear error while typing when value becomes valid', () => {
            const spy = jest.spyOn(PROGRAM_SECTION_VALIDATION_FUNCTIONS, 'validateSectionTitle');

            const { result } = renderHook(() => useProgramSectionValidation({ template: TEMPLATE }));

            act(() => {
                result.current.handleTitleBlur(createBlurEvent(''));
            });
            expect(result.current.titleError).toBeDefined();

            act(() => {
                result.current.handleTitleChange(createChangeEvent('Valid Title'));
            });

            expect(result.current.titleError).toBeUndefined();
            expect(spy).toHaveBeenCalled();

            spy.mockRestore();
        });

        it('should keep error while typing when value is still invalid', () => {
            const spy = jest.spyOn(PROGRAM_SECTION_VALIDATION_FUNCTIONS, 'validateSectionTitle');

            const { result } = renderHook(() => useProgramSectionValidation({ template: TEMPLATE }));

            act(() => {
                result.current.handleTitleBlur(createBlurEvent(''));
            });

            const initialError = result.current.titleError;

            act(() => {
                result.current.handleTitleChange(createChangeEvent('   '));
            });

            expect(result.current.titleError).toBe(initialError);
            expect(spy).toHaveBeenCalled();

            spy.mockRestore();
        });
    });

    describe('description validation', () => {
        it('should not show error initially', () => {
            const { result } = renderHook(() => useProgramSectionValidation({ template: TEMPLATE }));
            expect(result.current.descriptionError).toBeUndefined();
        });

        it.each([
            ['empty', ''],
            ['whitespace-only', '     '],
        ])('should show required error on blur when description is %s', (_, value) => {
            const { result } = renderHook(() => useProgramSectionValidation({ template: TEMPLATE }));

            act(() => {
                result.current.handleDescriptionBlur(createTextAreaBlurEvent(value));
            });

            expect(result.current.descriptionError).toBe(PROGRAM_SECTION_VALIDATION.description.getRequiredError());
        });

        it('should not show error for short but non-empty description in draft mode', () => {
            const { result } = renderHook(() => useProgramSectionValidation({ template: TEMPLATE }));
            const shortButNotEmpty = 'a'.repeat(Math.max(1, descriptionReq.min - 1));

            act(() => {
                result.current.handleDescriptionBlur(createTextAreaBlurEvent(shortButNotEmpty));
            });

            expect(result.current.descriptionError).toBeUndefined();
        });

        it('should show min error when description is too short in publishing mode', () => {
            const { result } = renderHook(() =>
                useProgramSectionValidation({ template: TEMPLATE, isPublishing: true }),
            );

            const tooShort = 'a'.repeat(Math.max(0, descriptionReq.min - 1));

            act(() => {
                result.current.handleDescriptionBlur(createTextAreaBlurEvent(tooShort));
            });

            expect(result.current.descriptionError).toBe(
                COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(descriptionReq.min),
            );
        });

        it('should show max error when description exceeds max (draft)', () => {
            const { result } = renderHook(() => useProgramSectionValidation({ template: TEMPLATE }));
            const tooLong = 'a'.repeat(descriptionReq.max + 1);

            act(() => {
                result.current.handleDescriptionBlur(createTextAreaBlurEvent(tooLong));
            });

            expect(result.current.descriptionError).toBe(
                COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(descriptionReq.max),
            );
        });

        it('should trim spaces on blur', () => {
            const onDescriptionChange = jest.fn();
            const { result } = renderHook(() =>
                useProgramSectionValidation({ template: TEMPLATE, onDescriptionChange }),
            );

            act(() => {
                result.current.handleDescriptionBlur(createTextAreaBlurEvent('  Valid description here  '));
            });

            expect(onDescriptionChange).toHaveBeenCalledWith('Valid description here');
        });

        it('should not validate on change when there is no error', () => {
            const spy = jest.spyOn(PROGRAM_SECTION_VALIDATION_FUNCTIONS, 'validateSectionDescription');

            const { result } = renderHook(() => useProgramSectionValidation({ template: TEMPLATE }));

            act(() => {
                result.current.handleDescriptionChange(createTextAreaChangeEvent('Some description'));
            });

            expect(result.current.descriptionError).toBeUndefined();
            expect(spy).not.toHaveBeenCalled();

            spy.mockRestore();
        });

        it('should clear error while typing when value becomes valid', () => {
            const spy = jest.spyOn(PROGRAM_SECTION_VALIDATION_FUNCTIONS, 'validateSectionDescription');

            const { result } = renderHook(() => useProgramSectionValidation({ template: TEMPLATE }));
            const valid = 'a'.repeat(Math.min(descriptionReq.max, Math.max(1, descriptionReq.min)));

            act(() => {
                result.current.handleDescriptionBlur(createTextAreaBlurEvent(''));
            });
            expect(result.current.descriptionError).toBeDefined();

            act(() => {
                result.current.handleDescriptionChange(createTextAreaChangeEvent(valid));
            });

            expect(result.current.descriptionError).toBeUndefined();
            expect(spy).toHaveBeenCalled();

            spy.mockRestore();
        });

        it('should keep error while typing when value is still invalid', () => {
            const spy = jest.spyOn(PROGRAM_SECTION_VALIDATION_FUNCTIONS, 'validateSectionDescription');

            const { result } = renderHook(() => useProgramSectionValidation({ template: TEMPLATE }));

            act(() => {
                result.current.handleDescriptionBlur(createTextAreaBlurEvent(''));
            });

            const initialError = result.current.descriptionError;

            act(() => {
                result.current.handleDescriptionChange(createTextAreaChangeEvent('   '));
            });

            expect(result.current.descriptionError).toBe(initialError);
            expect(spy).toHaveBeenCalled();

            spy.mockRestore();
        });
    });

    describe('callback props', () => {
        it('should call onTitleChange when title changes', () => {
            const onTitleChange = jest.fn();
            const { result } = renderHook(() => useProgramSectionValidation({ template: TEMPLATE, onTitleChange }));

            act(() => {
                result.current.handleTitleChange(createChangeEvent('New Title'));
            });

            expect(onTitleChange).toHaveBeenCalledWith('New Title');
        });

        it('should call onDescriptionChange when description changes', () => {
            const onDescriptionChange = jest.fn();
            const { result } = renderHook(() =>
                useProgramSectionValidation({ template: TEMPLATE, onDescriptionChange }),
            );

            act(() => {
                result.current.handleDescriptionChange(createTextAreaChangeEvent('New Description'));
            });

            expect(onDescriptionChange).toHaveBeenCalledWith('New Description');
        });

        it('should work without callback props', () => {
            const { result } = renderHook(() => useProgramSectionValidation({ template: TEMPLATE }));

            expect(() => {
                act(() => {
                    result.current.handleTitleChange(createChangeEvent('Title'));
                });
            }).not.toThrow();
        });
    });
});
