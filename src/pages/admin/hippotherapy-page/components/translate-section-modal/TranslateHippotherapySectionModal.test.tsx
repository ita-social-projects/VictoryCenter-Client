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
const titleInput = (sectionKey: string) =>
    screen.getByTestId(`mock-rich-input-hippotherapy-translation-${sectionKey}-title`);
const descriptionInput = (sectionKey: string) =>
    screen.getByTestId(`mock-rich-input-hippotherapy-translation-${sectionKey}-description`);
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
        renderModal({ block: HippotherapyPageLocalizationBlock.HippoventionCenter });

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

    it.each([
        [
            'Intro',
            HippotherapyPageLocalizationBlock.Intro,
            'introSection',
            HIPPOTHERAPY_PAGE_CHAR_LIMITS.INTRO_TITLE,
            HIPPOTHERAPY_PAGE_CHAR_LIMITS.INTRO_DESCRIPTION,
        ],
        [
            'Description',
            HippotherapyPageLocalizationBlock.Description,
            'descriptionSection',
            HIPPOTHERAPY_PAGE_CHAR_LIMITS.TEXT_CARD_TITLE,
            HIPPOTHERAPY_PAGE_CHAR_LIMITS.TEXT_CARD_DESCRIPTION,
        ],
        [
            'Hippovention',
            HippotherapyPageLocalizationBlock.Hippovention,
            'hippoventionSection',
            HIPPOTHERAPY_PAGE_CHAR_LIMITS.TEXT_CARD_TITLE,
            HIPPOTHERAPY_PAGE_CHAR_LIMITS.TEXT_CARD_DESCRIPTION,
        ],
        [
            'Analysis',
            HippotherapyPageLocalizationBlock.Analysis,
            'analysisSection',
            HIPPOTHERAPY_PAGE_CHAR_LIMITS.TEXT_CARD_TITLE,
            HIPPOTHERAPY_PAGE_CHAR_LIMITS.TEXT_CARD_DESCRIPTION,
        ],
    ])(
        'opens "Додати переклад" with empty fields and correct limits for %s section (Set #1)',
        (_name, block, sectionKey, titleLimit, descLimit) => {
            renderModal({ block });

            expect(screen.getByText(COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION)).toBeInTheDocument();
            expect(screen.getByLabelText(COMMON_TEXT_ADMIN.TYPE.TITLE)).toBe(titleInput(sectionKey));
            expect(screen.getByLabelText(COMMON_TEXT_ADMIN.TYPE.DESCRIPTION)).toBe(descriptionInput(sectionKey));
            expect(titleInput(sectionKey)).toHaveValue('');
            expect(descriptionInput(sectionKey)).toHaveValue('');
            expect(titleInput(sectionKey)).toHaveAttribute('maxLength', String(titleLimit));
            expect(descriptionInput(sectionKey)).toHaveAttribute('maxLength', String(descLimit));
            expect(saveButton()).toBeDisabled();
            expect(closeButton()).toBeEnabled();
        },
    );

    it('enables the save button for Set #1 section when both title and description are valid', () => {
        renderModal({ block: HippotherapyPageLocalizationBlock.Intro });

        fireEvent.change(titleInput('introSection'), { target: { value: 'Valid Title' } });
        expect(saveButton()).toBeDisabled();

        fireEvent.change(descriptionInput('introSection'), { target: { value: 'Valid translation description' } });
        expect(saveButton()).toBeEnabled();
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

    it('restricts the language options to English only even when other languages are provided', () => {
        renderModal({ translatedLanguages: [englishLanguage, frenchLanguage] });

        expect(screen.getByText('Англійська')).toBeInTheDocument();
        expect(screen.queryByText('Французька')).not.toBeInTheDocument();
    });

    it('resets the language selection to English on reopen', () => {
        const props = {
            onClose: jest.fn(),
            block: HippotherapyPageLocalizationBlock.Quote,
            translatedLanguages: [englishLanguage],
        };
        const { rerender } = render(<TranslateHippotherapySectionModal isOpen {...props} />);

        expect(screen.getByText('Англійська')).toBeInTheDocument();

        rerender(<TranslateHippotherapySectionModal isOpen={false} {...props} />);
        rerender(<TranslateHippotherapySectionModal isOpen {...props} />);

        expect(screen.getByText('Англійська')).toBeInTheDocument();
    });
});
