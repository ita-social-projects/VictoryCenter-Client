import '@testing-library/jest-dom';
import { render, act } from '@testing-library/react';
import React from 'react';
import { TranslateEventCategoryModal } from './TranslateEventCategoryModal';
import { LocalizationModal } from '@/components/admin/localization-modal/LocalizationModal';
import { TranslationControls } from '@/components/admin/translation-controls/TranslationControls';
import {
    TranslateEventCategoryFormProps,
    TranslateEventCategoryFormRef,
} from '../translate-event-category-form/TranslateEventCategoryForm';
import { EventCategoryDto } from '@/types/admin/event-category';
import { LocalizationLanguage } from '@/types/common/language';
import { EVENT_CATEGORY_TEXT } from '@/const/admin/events';
import { DEFAULT_LOCALE } from '@/const/common/locales';

jest.mock('@/components/admin/localization-modal/LocalizationModal', () => ({
    LocalizationModal: jest.fn(),
}));

jest.mock('@/components/admin/translation-controls/TranslationControls', () => ({
    TranslationControls: jest.fn(),
}));

const mockFormRender = jest.fn();
const mockFormSubmit = jest.fn();
const mockFormIsValid = jest.fn();
const mockFormIsDirty = jest.fn();

jest.mock('../translate-event-category-form/TranslateEventCategoryForm', () => {
    const ReactActual = jest.requireActual('react');
    return {
        TranslateEventCategoryForm: ReactActual.forwardRef(
            (props: TranslateEventCategoryFormProps, ref: React.Ref<TranslateEventCategoryFormRef>) => {
                mockFormRender(props);
                ReactActual.useImperativeHandle(ref, () => ({
                    submit: mockFormSubmit,
                    isValid: mockFormIsValid,
                    isDirty: mockFormIsDirty,
                }));
                return <div data-testid="translate-event-category-form" />;
            },
        ),
    };
});

const mockedLocalizationModal = LocalizationModal as jest.Mock;
const mockedTranslationControls = TranslationControls as jest.Mock;

describe('TranslateEventCategoryModal', () => {
    const categories: EventCategoryDto[] = [
        { id: 2, name: 'Zebra Category', relatedEventNewsCount: 0 },
        { id: 1, name: 'Alpha Category', relatedEventNewsCount: 2 },
    ];

    const translationLanguages: LocalizationLanguage[] = [
        { id: 1, code: DEFAULT_LOCALE, name: 'Українська' },
        { id: 2, code: 'en', name: 'Англійська' },
    ];

    const onClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        mockedLocalizationModal.mockImplementation(({ children }) => (
            <div data-testid="localization-modal">{children}</div>
        ));
        mockedTranslationControls.mockImplementation(() => <div data-testid="translation-controls" />);
        mockFormIsValid.mockReturnValue(true);
        mockFormIsDirty.mockReturnValue(false);
    });

    it('filters out DEFAULT_LOCALE and sorts categories alphabetically (A-Z)', () => {
        render(
            <TranslateEventCategoryModal
                isOpen={true}
                categories={categories}
                onClose={onClose}
                translationLanguages={translationLanguages}
            />,
        );

        const controlsProps = mockedTranslationControls.mock.calls.at(-1)[0];
        expect(controlsProps.languages).toEqual([{ id: 2, code: 'en', name: 'Англійська' }]);
        expect(controlsProps.selectedLanguage).toEqual({ id: 2, code: 'en', name: 'Англійська' });

        const formProps = mockFormRender.mock.calls.at(-1)[0];
        expect(formProps.categories.map((c: EventCategoryDto) => c.name)).toEqual(['Alpha Category', 'Zebra Category']);
        expect(formProps.selectedCategory).toBeNull();
    });

    it('passes correct title and initial invalid state to LocalizationModal', () => {
        render(
            <TranslateEventCategoryModal
                isOpen={true}
                categories={categories}
                onClose={onClose}
                translationLanguages={translationLanguages}
            />,
        );

        const modalProps = mockedLocalizationModal.mock.calls.at(-1)[0];
        expect(modalProps.title).toBe(EVENT_CATEGORY_TEXT.TRANSLATION_MODAL.TITLE);
        expect(modalProps.isOpen).toBe(true);
        expect(modalProps.isFormValid).toBe(false);
        expect(modalProps.isDirty).toBe(false);
    });

    it('enables save only when both category is selected and form is valid, then submits on save', () => {
        render(
            <TranslateEventCategoryModal
                isOpen={true}
                categories={categories}
                onClose={onClose}
                translationLanguages={translationLanguages}
            />,
        );

        const initialFormProps = mockFormRender.mock.calls.at(-1)[0];

        act(() => {
            initialFormProps.onValidationChange(true);
        });
        expect(mockedLocalizationModal.mock.calls.at(-1)[0].isFormValid).toBe(false);

        act(() => {
            initialFormProps.onCategoryChange(categories[1]);
        });

        const updatedModalProps = mockedLocalizationModal.mock.calls.at(-1)[0];
        expect(updatedModalProps.isFormValid).toBe(true);

        act(() => {
            updatedModalProps.onSave();
        });
        expect(mockFormSubmit).toHaveBeenCalledTimes(1);
    });

    it('does not call form submit when handleSaveClick is called while invalid', () => {
        render(
            <TranslateEventCategoryModal
                isOpen={true}
                categories={categories}
                onClose={onClose}
                translationLanguages={translationLanguages}
            />,
        );

        const modalProps = mockedLocalizationModal.mock.calls.at(-1)[0];
        act(() => {
            modalProps.onSave();
        });

        expect(mockFormSubmit).not.toHaveBeenCalled();
    });

    it('closes modal and resets state when form onSubmit is triggered', async () => {
        render(
            <TranslateEventCategoryModal
                isOpen={true}
                categories={categories}
                onClose={onClose}
                translationLanguages={translationLanguages}
            />,
        );

        const formProps = mockFormRender.mock.calls.at(-1)[0];

        await act(async () => {
            await formProps.onSubmit({ name: 'Translated Name' });
        });

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('tracks dirty state via checkIsDirty', () => {
        render(
            <TranslateEventCategoryModal
                isOpen={true}
                categories={categories}
                onClose={onClose}
                translationLanguages={translationLanguages}
            />,
        );

        const formProps = mockFormRender.mock.calls.at(-1)[0];

        act(() => {
            formProps.onDirtyChange(true);
        });

        const modalProps = mockedLocalizationModal.mock.calls.at(-1)[0];
        expect(modalProps.isDirty).toBe(true);
        expect(modalProps.checkIsDirty()).toBe(true);
    });
});
