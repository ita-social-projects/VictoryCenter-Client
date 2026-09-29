import { act, renderHook } from '@testing-library/react';
import { useTranslationModal } from './useTranslationModal';
import { ModalMode } from '@/types/admin/common';
import { EntityLocalization, TranslationStatus } from '@/types/common/language';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

const englishLanguage = { id: 2, code: 'en', name: 'English' };
const ukrainianLanguage = { id: 1, code: 'uk', name: 'Українська' };

describe('useTranslationModal', () => {
    it('defaults language to the first translated language when there is only one', () => {
        const { result } = renderHook(() =>
            useTranslationModal({ localizations: [], translatedLanguages: [englishLanguage] }),
        );

        expect(result.current.language).toEqual(englishLanguage);
    });

    it('selects the first non-default-locale language once translatedLanguages loads after initial render', () => {
        const { result, rerender } = renderHook(
            (props: { translatedLanguages: (typeof englishLanguage)[] }) =>
                useTranslationModal({ localizations: [], translatedLanguages: props.translatedLanguages }),
            { initialProps: { translatedLanguages: [] as (typeof englishLanguage)[] } },
        );

        expect(result.current.language).toBeNull();

        rerender({ translatedLanguages: [ukrainianLanguage, englishLanguage] });

        expect(result.current.language?.code).toBe('en');
    });

    it('resolves Add mode and title when no localization exists for the selected language', () => {
        const { result } = renderHook(() =>
            useTranslationModal({ localizations: [], translatedLanguages: [englishLanguage] }),
        );

        expect(result.current.mode).toBe(ModalMode.Add);
        expect(result.current.isEditMode).toBe(false);
        expect(result.current.modalTitle).toBe(COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION);
        expect(result.current.existingLocalization).toBeNull();
    });

    it('resolves Edit mode and title when a localization exists for the selected language', () => {
        const localizations: EntityLocalization[] = [
            { language: englishLanguage, translationStatus: TranslationStatus.Relevant },
        ];

        const { result } = renderHook(() =>
            useTranslationModal({ localizations, translatedLanguages: [englishLanguage] }),
        );

        expect(result.current.mode).toBe(ModalMode.Edit);
        expect(result.current.isEditMode).toBe(true);
        expect(result.current.modalTitle).toBe(COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.UPDATE_TRANSLATION);
        expect(result.current.existingLocalization).toEqual(localizations[0]);
    });

    it('handleSaveClick does nothing when the form ref reports invalid', () => {
        const { result } = renderHook(() =>
            useTranslationModal({ localizations: [], translatedLanguages: [englishLanguage] }),
        );

        const submit = jest.fn();
        (result.current.formRef as React.MutableRefObject<any>).current = {
            isValid: () => false,
            isDirty: () => false,
            submit,
        };

        act(() => {
            result.current.handleSaveClick();
        });

        expect(submit).not.toHaveBeenCalled();
    });

    it('handleSaveClick submits when the form ref reports valid', () => {
        const { result } = renderHook(() =>
            useTranslationModal({ localizations: [], translatedLanguages: [englishLanguage] }),
        );

        const submit = jest.fn();
        (result.current.formRef as React.MutableRefObject<any>).current = {
            isValid: () => true,
            isDirty: () => false,
            submit,
        };

        act(() => {
            result.current.handleSaveClick();
        });

        expect(submit).toHaveBeenCalledTimes(1);
    });

    it('checkIsDirty reflects the form ref, defaulting to false when there is no ref yet', () => {
        const { result } = renderHook(() =>
            useTranslationModal({ localizations: [], translatedLanguages: [englishLanguage] }),
        );

        expect(result.current.checkIsDirty()).toBe(false);

        (result.current.formRef as React.MutableRefObject<any>).current = {
            isValid: () => true,
            isDirty: () => true,
            submit: jest.fn(),
        };

        expect(result.current.checkIsDirty()).toBe(true);
    });
});
