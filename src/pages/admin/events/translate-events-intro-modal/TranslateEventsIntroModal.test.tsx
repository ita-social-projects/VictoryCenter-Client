import '@testing-library/jest-dom';
import { useState } from 'react';
import { act, fireEvent, getDefaultNormalizer, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { EVENTS_TEXT } from '@/const/admin/events';
import { LocalizationLanguage } from '@/types/common/language';
import { TranslateEventsIntroModal } from './TranslateEventsIntroModal';

const translationLanguages: LocalizationLanguage[] = [
    { id: 2, code: 'en', name: 'Англійська' },
    { id: 3, code: 'de', name: 'Німецька' },
];

const TranslationModalHarness = ({ field = 'pageDescription' }: { field?: 'pageDescription' | 'eventsBlockTitle' }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <>
            <button type="button" onClick={() => setIsOpen(true)}>
                Відкрити модалку
            </button>
            <TranslateEventsIntroModal
                isOpen={isOpen}
                field={field}
                translationLanguages={translationLanguages}
                onClose={() => setIsOpen(false)}
            />
        </>
    );
};

const getTranslationField = (label: string) => screen.getByRole('textbox', { name: new RegExp(label) });

describe('TranslateEventsIntroModal', () => {
    it('renders the page description translation modal with an empty textarea', () => {
        render(<TranslationModalHarness />);

        expect(screen.getByText(COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION)).toBeInTheDocument();
        const field = getTranslationField(EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.TITLE);

        expect(field).toBeInstanceOf(HTMLTextAreaElement);
        expect(field).toHaveValue('');
        expect(
            screen
                .getByText(EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.TITLE)
                .closest('label')
                ?.querySelector('.required-field'),
        ).toHaveTextContent('*');
        expect(screen.getByText('0/1000')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_TRANSLATION })).toBeDisabled();
    });

    it('renders the events block title translation modal with an empty textarea', () => {
        render(<TranslationModalHarness field="eventsBlockTitle" />);

        const field = getTranslationField(EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.TITLE);

        expect(field).toBeInstanceOf(HTMLTextAreaElement);
        expect(field).toHaveValue('');
        expect(
            screen
                .getByText(EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.TITLE)
                .closest('label')
                ?.querySelector('.required-field'),
        ).toHaveTextContent('*');
        expect(screen.getByText('0/100')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_TRANSLATION })).toBeDisabled();
    });

    it('provides only English as the selectable language', async () => {
        const user = userEvent.setup();
        render(<TranslationModalHarness />);

        expect(screen.getByRole('button', { name: 'Англійська' })).toBeEnabled();
        await user.click(screen.getByRole('button', { name: 'Англійська' }));

        expect(screen.getAllByText('Англійська')).toHaveLength(2);
        expect(screen.queryByText('Німецька')).not.toBeInTheDocument();
    });

    it('closes an empty modal through the close control', async () => {
        const user = userEvent.setup();
        render(<TranslationModalHarness />);

        await user.click(screen.getByRole('button', { name: 'Close modal' }));

        expect(screen.queryByTestId('modal-overlay')).not.toBeInTheDocument();
    });

    it('asks for confirmation after data is entered and keeps the value when cancellation is declined', async () => {
        const user = userEvent.setup();
        render(<TranslationModalHarness />);
        const field = getTranslationField(EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.TITLE);

        await user.type(field, 'Translation draft');
        await user.click(screen.getByRole('button', { name: 'Close modal' }));

        expect(
            screen.getByText(COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE, {
                normalizer: getDefaultNormalizer({ collapseWhitespace: false }),
            }),
        ).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.NO }));

        expect(field).toHaveValue('Translation draft');
        expect(screen.getByText(COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION)).toBeInTheDocument();
    });

    it('clears data and closes after confirming discard', async () => {
        const user = userEvent.setup();
        render(<TranslationModalHarness />);

        await user.type(
            getTranslationField(EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.TITLE),
            'Translation draft',
        );
        await user.click(screen.getByRole('button', { name: 'Close modal' }));
        await user.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES }));

        expect(screen.queryByTestId('modal-overlay')).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Відкрити модалку' }));

        expect(getTranslationField(EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.TITLE)).toHaveValue('');
    });

    it('clears a draft when the parent closes the modal or switches the translated field', async () => {
        const user = userEvent.setup();
        const onClose = jest.fn();
        const { rerender } = render(
            <TranslateEventsIntroModal
                isOpen
                field="pageDescription"
                translationLanguages={translationLanguages}
                onClose={onClose}
            />,
        );

        await user.type(
            getTranslationField(EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.TITLE),
            'Translation draft',
        );

        rerender(
            <TranslateEventsIntroModal
                isOpen
                field="eventsBlockTitle"
                translationLanguages={translationLanguages}
                onClose={onClose}
            />,
        );
        expect(getTranslationField(EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.TITLE)).toHaveValue('');

        await user.type(getTranslationField(EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.TITLE), 'Draft');
        rerender(
            <TranslateEventsIntroModal
                isOpen={false}
                field="eventsBlockTitle"
                translationLanguages={translationLanguages}
                onClose={onClose}
            />,
        );
        rerender(
            <TranslateEventsIntroModal
                isOpen
                field="eventsBlockTitle"
                translationLanguages={translationLanguages}
                onClose={onClose}
            />,
        );

        expect(getTranslationField(EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.TITLE)).toHaveValue('');
    });

    it('opens the confirmation modal when closing a changed form with Escape', async () => {
        const user = userEvent.setup();
        render(<TranslationModalHarness />);

        await user.type(
            getTranslationField(EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.TITLE),
            'Translation draft',
        );
        await act(async () => {
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        });

        expect(
            await screen.findByText(COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE, {
                normalizer: getDefaultNormalizer({ collapseWhitespace: false }),
            }),
        ).toBeInTheDocument();
    });

    it.each([
        ['pageDescription', EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.TITLE],
        ['eventsBlockTitle', EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.TITLE],
    ] as const)(
        'validates the %s translation on blur and clears errors while correcting the value',
        async (fieldName, label) => {
            const user = userEvent.setup();
            render(<TranslationModalHarness field={fieldName} />);
            const field = getTranslationField(label);

            await user.click(field);
            await user.tab();
            expect(screen.getByText(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED)).toBeInTheDocument();

            await user.type(field, '12345678');
            await user.tab();
            expect(screen.getByText(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(10))).toBeInTheDocument();

            await user.type(field, '9');
            expect(screen.queryByText(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(10))).not.toBeInTheDocument();

            await user.tab();
            expect(screen.getByText(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(10))).toBeInTheDocument();

            await user.type(field, '0');
            expect(screen.queryByText(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(10))).not.toBeInTheDocument();
            expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_TRANSLATION })).toBeDisabled();
        },
    );

    it('normalizes whitespace before validating a page description translation', async () => {
        const user = userEvent.setup();
        render(<TranslationModalHarness />);
        const field = getTranslationField(EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.TITLE);

        await user.type(field, '   ');
        await user.tab();

        expect(field).toHaveValue('');
        expect(screen.getByText(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED)).toBeInTheDocument();
    });

    it.each([
        ['pageDescription', EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.TITLE, 1000],
        ['eventsBlockTitle', EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.TITLE, 100],
    ] as const)('keeps saving disabled at the %s maximum-length boundary', (fieldName, label, max) => {
        render(<TranslationModalHarness field={fieldName} />);
        const field = getTranslationField(label);

        fireEvent.change(field, { target: { value: 'a'.repeat(max) } });
        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_TRANSLATION })).toBeDisabled();
    });
});
