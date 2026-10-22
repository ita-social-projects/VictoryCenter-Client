import '@testing-library/jest-dom';
import { useState } from 'react';
import { act, fireEvent, getDefaultNormalizer, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { EVENTS_TEXT } from '@/const/admin/events';
import { LocalizationLanguage } from '@/types/common/language';
import { EventsIntroSectionDto } from '@/types/admin/events';
import { TranslateEventsIntroModal } from './TranslateEventsIntroModal';
import { EventsIntroSectionLocalizationsApi } from '@/services/api/admin/events/events-intro-section-localizations/events-intro-section-localizations-api';

jest.mock('@/hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: () => ({}),
}));
jest.mock(
    '@/services/api/admin/events/events-intro-section-localizations/events-intro-section-localizations-api',
    () => ({
        EventsIntroSectionLocalizationsApi: {
            create: jest.fn(),
            update: jest.fn(),
        },
    }),
);

const introSection = {
    id: 1,
    eventsBlockTitle: 'Events title',
    pageDescription: 'Events description',
    isEventsBlockTitleHidden: false,
    isPageDescriptionHidden: false,
    localizations: [],
};
const onSaveSuccess = jest.fn().mockResolvedValue(undefined);
const mockedLocalizationsApi = EventsIntroSectionLocalizationsApi as jest.Mocked<
    typeof EventsIntroSectionLocalizationsApi
>;

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
                introSection={introSection}
                translationLanguages={translationLanguages}
                onClose={() => setIsOpen(false)}
                onSaveSuccess={onSaveSuccess}
            />
        </>
    );
};

const getTranslationField = (label: string) => screen.getByRole('textbox', { name: new RegExp(label) });

describe('TranslateEventsIntroModal', () => {
    beforeEach(() => {
        onSaveSuccess.mockClear();
        mockedLocalizationsApi.create.mockReset();
        mockedLocalizationsApi.update.mockReset();
    });
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
                introSection={introSection}
                translationLanguages={translationLanguages}
                onClose={onClose}
                onSaveSuccess={onSaveSuccess}
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
                introSection={introSection}
                translationLanguages={translationLanguages}
                onClose={onClose}
                onSaveSuccess={onSaveSuccess}
            />,
        );
        expect(getTranslationField(EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.TITLE)).toHaveValue('');

        await user.type(getTranslationField(EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.TITLE), 'Draft');
        rerender(
            <TranslateEventsIntroModal
                isOpen={false}
                field="eventsBlockTitle"
                introSection={introSection}
                translationLanguages={translationLanguages}
                onClose={onClose}
                onSaveSuccess={onSaveSuccess}
            />,
        );
        rerender(
            <TranslateEventsIntroModal
                isOpen
                field="eventsBlockTitle"
                introSection={introSection}
                translationLanguages={translationLanguages}
                onClose={onClose}
                onSaveSuccess={onSaveSuccess}
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
            expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_TRANSLATION })).toBeEnabled();
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
    ] as const)('enables saving at the valid %s maximum-length boundary', (fieldName, label, max) => {
        render(<TranslationModalHarness field={fieldName} />);
        const field = getTranslationField(label);

        fireEvent.change(field, { target: { value: 'a'.repeat(max) } });
        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_TRANSLATION })).toBeEnabled();
    });

    it('saves a valid first translation and closes after the parent refreshes the intro section', async () => {
        const user = userEvent.setup();
        mockedLocalizationsApi.create.mockResolvedValueOnce({} as never);
        render(<TranslationModalHarness />);

        await user.type(getTranslationField(EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.TITLE), 'English text');
        await user.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_TRANSLATION }));

        expect(mockedLocalizationsApi.create).toHaveBeenCalledWith(
            {},
            expect.objectContaining({
                entityId: 1,
                languageId: 2,
                pageDescription: 'English text',
            }),
        );
        expect(onSaveSuccess).toHaveBeenCalledTimes(1);
        expect(screen.queryByTestId('modal-overlay')).not.toBeInTheDocument();
    });

    it('saves the events block title independently from the page description', async () => {
        const user = userEvent.setup();
        mockedLocalizationsApi.create.mockResolvedValueOnce({} as never);
        render(<TranslationModalHarness field="eventsBlockTitle" />);

        await user.type(
            getTranslationField(EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.TITLE),
            'English title',
        );
        await user.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_TRANSLATION }));

        expect(mockedLocalizationsApi.create).toHaveBeenCalledWith(
            {},
            expect.objectContaining({
                entityId: 1,
                languageId: 2,
                eventsBlockTitle: 'English title',
            }),
        );
        expect(mockedLocalizationsApi.create).toHaveBeenCalledWith(
            {},
            expect.not.objectContaining({ pageDescription: expect.anything() }),
        );
    });

    it('creates a translation when an older intro response has no localizations collection', async () => {
        const user = userEvent.setup();
        mockedLocalizationsApi.create.mockResolvedValueOnce({} as never);
        const introSectionWithoutLocalizations = {
            ...introSection,
            localizations: undefined,
        } as unknown as EventsIntroSectionDto;

        render(
            <TranslateEventsIntroModal
                isOpen
                field="pageDescription"
                introSection={introSectionWithoutLocalizations}
                translationLanguages={translationLanguages}
                onClose={jest.fn()}
                onSaveSuccess={onSaveSuccess}
            />,
        );

        await user.type(getTranslationField(EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.TITLE), 'English text');
        await user.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_TRANSLATION }));

        expect(mockedLocalizationsApi.create).toHaveBeenCalledWith(
            {},
            expect.objectContaining({ pageDescription: 'English text' }),
        );
    });

    it('keeps the value in the modal when saving fails', async () => {
        const user = userEvent.setup();
        mockedLocalizationsApi.create.mockRejectedValueOnce(new Error('Request failed'));
        render(<TranslationModalHarness />);
        const field = getTranslationField(EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.TITLE);

        await user.type(field, 'English text');
        await user.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_TRANSLATION }));

        expect(field).toHaveValue('English text');
        expect(screen.getByText(COMMON_TEXT_ADMIN.MESSAGE.ERROR_TRY_AGAIN)).toBeInTheDocument();
        expect(screen.getByText(COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION)).toBeInTheDocument();
    });
});
