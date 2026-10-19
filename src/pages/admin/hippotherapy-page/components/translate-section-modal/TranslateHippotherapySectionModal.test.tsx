import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { HIPPOTHERAPY_PAGE_CHAR_LIMITS, HIPPOTHERAPY_PAGE_TEXT } from '@/const/admin/hippotherapy-page';
import { HippotherapyPageLocalizationBlock } from '@/types/admin/hippotherapy-page';
import {
    TranslateHippotherapySectionModal,
    TranslateHippotherapySectionModalProps,
} from './TranslateHippotherapySectionModal';

jest.mock('@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup');

jest.mock('@/components/admin/confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: ({ isOpen, title, onConfirm, onCancel }: any) =>
        isOpen ? (
            <div data-testid="confirmation-modal">
                <span data-testid="confirmation-title">{title}</span>
                <button onClick={onConfirm}>Так</button>
                <button onClick={onCancel}>Ні</button>
            </div>
        ) : null,
}));

const englishLanguage = { id: 2, code: 'en', name: 'Англійська' };
const frenchLanguage = { id: 3, code: 'fr', name: 'Французька' };
const VALID_TEXT = 'Valid translated quote';

const quoteInput = (sectionKey = 'quoteSection') =>
    screen.getByTestId(`mock-rich-input-hippotherapy-translation-${sectionKey}-quoteText`);
const authorInput = (sectionKey = 'quoteSection') =>
    screen.getByTestId(`mock-rich-input-hippotherapy-translation-${sectionKey}-authorName`);
const saveButton = () => screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_TRANSLATION });
const closeButton = () => screen.getByLabelText('Close modal');
const confirmationTitle = () => screen.getByTestId('confirmation-title').textContent;

const renderModal = (props: Partial<TranslateHippotherapySectionModalProps> = {}) => {
    const onClose = jest.fn();
    const view = render(
        <TranslateHippotherapySectionModal
            isOpen
            onClose={onClose}
            block={HippotherapyPageLocalizationBlock.Quote}
            translatedLanguages={[englishLanguage]}
            {...props}
        />,
    );

    return { onClose, ...view };
};

describe('TranslateHippotherapySectionModal', () => {
    it('renders nothing when closed', () => {
        renderModal({ isOpen: false });

        expect(screen.queryByText(COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION)).not.toBeInTheDocument();
    });

    it('renders nothing for a section without translation fields', () => {
        renderModal({ block: HippotherapyPageLocalizationBlock.Intro });

        expect(screen.queryByText(COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION)).not.toBeInTheDocument();
    });

    it.each([
        ['Quote', HippotherapyPageLocalizationBlock.Quote, 'quoteSection'],
        ['AnotherQuote', HippotherapyPageLocalizationBlock.AnotherQuote, 'anotherQuoteSection'],
    ])('opens "Додати переклад" with empty review fields for the %s section', (_name, block, sectionKey) => {
        renderModal({ block });

        expect(screen.getByText(COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION)).toBeInTheDocument();
        expect(screen.getByLabelText(COMMON_TEXT_ADMIN.TYPE.DESCRIPTION)).toBe(quoteInput(sectionKey));
        expect(screen.getByLabelText(HIPPOTHERAPY_PAGE_TEXT.LABEL.ADDITIONAL_DESCRIPTION)).toBe(
            authorInput(sectionKey),
        );
        expect(quoteInput(sectionKey)).toHaveValue('');
        expect(authorInput(sectionKey)).toHaveValue('');
        expect(quoteInput(sectionKey)).toHaveAttribute('maxLength', String(HIPPOTHERAPY_PAGE_CHAR_LIMITS.QUOTE_TEXT));
        expect(authorInput(sectionKey)).toHaveAttribute(
            'maxLength',
            String(HIPPOTHERAPY_PAGE_CHAR_LIMITS.QUOTE_AUTHOR),
        );
    });

    it('selects English by default and keeps the save button disabled on open', () => {
        renderModal();

        expect(screen.getByText('Англійська')).toBeInTheDocument();
        expect(saveButton()).toBeDisabled();
        expect(closeButton()).toBeEnabled();
    });

    it('enables the save button once the required field is valid', async () => {
        renderModal();

        fireEvent.change(quoteInput(), { target: { value: VALID_TEXT } });

        expect(saveButton()).toBeEnabled();
        fireEvent.click(saveButton());

        await waitFor(() => expect(saveButton()).toBeEnabled());
        expect(quoteInput()).toHaveValue(VALID_TEXT);
    });

    it('closes immediately when X is clicked and all fields are empty', () => {
        const { onClose } = renderModal();

        fireEvent.click(closeButton());

        expect(onClose).toHaveBeenCalledTimes(1);
        expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
    });

    it('asks for confirmation and closes without saving when "Так" is clicked after input', () => {
        const { onClose } = renderModal();

        fireEvent.change(authorInput(), { target: { value: 'Some author' } });
        fireEvent.click(closeButton());

        expect(confirmationTitle()).toBe(COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE);
        expect(onClose).not.toHaveBeenCalled();

        fireEvent.click(screen.getByText('Так'));

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('keeps the modal open with the input preserved when "Ні" is clicked', () => {
        const { onClose } = renderModal();

        fireEvent.change(quoteInput(), { target: { value: VALID_TEXT } });
        fireEvent.click(closeButton());
        fireEvent.click(screen.getByText('Ні'));

        expect(onClose).not.toHaveBeenCalled();
        expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
        expect(quoteInput()).toHaveValue(VALID_TEXT);
    });

    it('selects a language once the languages load while the modal is open', async () => {
        const { rerender } = renderModal({ translatedLanguages: [] });

        expect(screen.queryByText('Англійська')).not.toBeInTheDocument();

        rerender(
            <TranslateHippotherapySectionModal
                isOpen
                onClose={jest.fn()}
                block={HippotherapyPageLocalizationBlock.Quote}
                translatedLanguages={[englishLanguage]}
            />,
        );

        expect(await screen.findByText('Англійська')).toBeInTheDocument();
    });

    it('switches the language right away when nothing has been entered', () => {
        renderModal({ translatedLanguages: [englishLanguage, frenchLanguage] });

        fireEvent.click(screen.getByText('Англійська'));
        fireEvent.click(screen.getByText('Французька'));

        expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
        expect(screen.getByText('Французька')).toBeInTheDocument();
    });

    it('asks before switching the language with unsaved input and switches when confirmed', async () => {
        renderModal({ translatedLanguages: [englishLanguage, frenchLanguage] });

        fireEvent.change(quoteInput(), { target: { value: VALID_TEXT } });
        fireEvent.click(screen.getByText('Англійська'));
        fireEvent.click(screen.getByText('Французька'));

        expect(confirmationTitle()).toBe(COMMON_TEXT_ADMIN.QUESTION.CHANGE_LANGUAGE_UNSAVED_CHANGES);

        fireEvent.click(screen.getByText('Так'));

        await waitFor(() => expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument());
        expect(screen.getByText('Французька')).toBeInTheDocument();
        expect(quoteInput()).toHaveValue('');
    });

    it('keeps the language and input when the language switch is cancelled', () => {
        renderModal({ translatedLanguages: [englishLanguage, frenchLanguage] });

        fireEvent.change(quoteInput(), { target: { value: VALID_TEXT } });
        fireEvent.click(screen.getByText('Англійська'));
        fireEvent.click(screen.getByText('Французька'));
        fireEvent.click(screen.getByText('Ні'));

        expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
        expect(screen.getByText('Англійська')).toBeInTheDocument();
        expect(quoteInput()).toHaveValue(VALID_TEXT);
    });

    it('drops a pending language switch when the modal is closed', () => {
        const props = {
            onClose: jest.fn(),
            block: HippotherapyPageLocalizationBlock.Quote,
            translatedLanguages: [englishLanguage, frenchLanguage],
        };
        const { rerender } = render(<TranslateHippotherapySectionModal isOpen {...props} />);

        fireEvent.change(quoteInput(), { target: { value: VALID_TEXT } });
        fireEvent.click(screen.getByText('Англійська'));
        fireEvent.click(screen.getByText('Французька'));
        expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();

        rerender(<TranslateHippotherapySectionModal isOpen={false} {...props} />);
        rerender(<TranslateHippotherapySectionModal isOpen {...props} />);

        expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
    });
});
