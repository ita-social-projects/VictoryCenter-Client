import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';

import { MainPageLocalizationsApi } from '@/services/api/admin/main-page/main-page-localizations-api/main-page-localizations-api';
import { MainPage, MainPageLocalizationBlock } from '@/types/admin/main-page';
import { TranslationStatus } from '@/types/common/language';
import { TranslateMainPageBlockModal } from './TranslateMainPageBlockModal';

jest.mock('@/hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: () => ({}),
}));

jest.mock('@/services/api/admin/main-page/main-page-localizations-api/main-page-localizations-api', () => ({
    MainPageLocalizationsApi: {
        getByLanguageId: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
}));

jest.mock('@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup', () => ({
    __esModule: true,
    RichTextInputGroup: require('@/utils/test-mocks/main-page-mocks').MockRichTextInputGroup,
}));

const englishLanguage = { id: 2, code: 'en', name: 'Англійська' };

const basePage: MainPage = {
    id: 1,
    title: 'Український заголовок',
    description: 'Український опис',
    image: null,
    localizations: [],
    mainAboutUs: {
        id: 10,
        title: 'Про нас',
        description: 'Опис про нас',
        localizations: [],
    },
    mainPartners: {
        id: 20,
        title: 'Партнери',
        description: 'Опис партнерів',
        localizations: [],
    },
    impactStatistics: null,
};

const titleInput = () => document.getElementById('main-page-translation-title') as HTMLInputElement;
const descriptionInput = () => document.getElementById('main-page-translation-description') as HTMLTextAreaElement;
const saveButton = () => screen.getByText('Зберегти переклад').closest('button') as HTMLButtonElement;

const renderModal = (props?: Partial<React.ComponentProps<typeof TranslateMainPageBlockModal>>) => {
    const onClose = jest.fn();
    const onTranslated = jest.fn();

    render(
        <TranslateMainPageBlockModal
            isOpen
            onClose={onClose}
            page={basePage}
            block={MainPageLocalizationBlock.Title}
            translatedLanguages={[englishLanguage]}
            onTranslated={onTranslated}
            {...props}
        />,
    );

    return { onClose, onTranslated };
};

describe('TranslateMainPageBlockModal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(axios, 'isAxiosError').mockReturnValue(false);
        (MainPageLocalizationsApi.create as jest.Mock).mockResolvedValue({
            entityId: 1,
            title: 'Valid title text',
            description: 'Valid description text',
            translationStatus: TranslationStatus.Relevant,
            localizationInfoDto: englishLanguage,
            mainAboutUs: null,
            mainPartners: null,
        });
        (MainPageLocalizationsApi.update as jest.Mock).mockResolvedValue({
            entityId: 1,
            title: 'Updated title text',
            description: 'Updated description text',
            translationStatus: TranslationStatus.Relevant,
            localizationInfoDto: englishLanguage,
            mainAboutUs: null,
            mainPartners: null,
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('renders add mode with empty fields, English dropdown, disabled save, and no generate button', () => {
        renderModal();

        expect(screen.getByText('Додати переклад')).toBeInTheDocument();
        expect(screen.getByText('Англійська')).toBeInTheDocument();
        expect(screen.queryByText('Згенерувати переклад')).not.toBeInTheDocument();
        expect(titleInput()).toHaveValue('');
        expect(descriptionInput()).toHaveValue('');
        expect(saveButton()).toBeDisabled();
    });

    it('renders only English option in the language dropdown', () => {
        renderModal();

        fireEvent.click(screen.getByText('Англійська'));

        expect(screen.getAllByText('Англійська')).toHaveLength(2);
        fireEvent.click(screen.getAllByText('Англійська')[1]);
        expect(screen.getByText('Англійська')).toBeInTheDocument();
    });

    it('does not render language dropdown when target language is unavailable', () => {
        renderModal({ translatedLanguages: [] });

        expect(screen.queryByText('Англійська')).not.toBeInTheDocument();
    });

    it('renders edit mode with existing English localization', () => {
        renderModal({
            page: {
                ...basePage,
                localizations: [
                    {
                        languageId: englishLanguage.id,
                        language: englishLanguage,
                        title: 'Existing title',
                        description: 'Existing description',
                        translationStatus: TranslationStatus.Relevant,
                    },
                ],
            },
        });

        expect(screen.getByText('Редагувати переклад')).toBeInTheDocument();
        expect(titleInput()).toHaveValue('Existing title');
        expect(descriptionInput()).toHaveValue('Existing description');
        expect(saveButton()).toBeDisabled();
    });

    it('renders edit mode with API-shaped localizationInfoDto values for nested blocks', () => {
        renderModal({
            block: MainPageLocalizationBlock.AboutUs,
            page: {
                ...basePage,
                mainAboutUs: {
                    ...basePage.mainAboutUs!,
                    localizations: [
                        {
                            entityId: 10,
                            localizationInfoDto: englishLanguage,
                            title: 'About us and who we are',
                            description: '<p>Victory Centre is a safe space.</p>',
                            translationStatus: TranslationStatus.Relevant,
                        } as any,
                    ],
                },
            },
        });

        expect(screen.getByText('Редагувати переклад')).toBeInTheDocument();
        expect(titleInput()).toHaveValue('About us and who we are');
        expect(descriptionInput()).toHaveValue('Victory Centre is a safe space.');
        expect(saveButton()).toBeDisabled();
    });

    it('renders edit mode with API-shaped root localizationInfoDto values', () => {
        renderModal({
            page: {
                ...basePage,
                localizations: [
                    {
                        entityId: 1,
                        localizationInfoDto: englishLanguage,
                        title: '<p>Horses with healing experience</p>',
                        description: 'When body and soul recover, true strength is born.',
                        translationStatus: TranslationStatus.Relevant,
                    } as any,
                ],
            },
        });

        expect(screen.getByText('Редагувати переклад')).toBeInTheDocument();
        expect(titleInput()).toHaveValue('Horses with healing experience');
        expect(descriptionInput()).toHaveValue('When body and soul recover, true strength is born.');
    });

    it('enables save after valid changes and creates localization with submitted data', async () => {
        jest.spyOn(axios, 'isAxiosError').mockReturnValue(true);
        (MainPageLocalizationsApi.getByLanguageId as jest.Mock).mockRejectedValue({ response: { status: 404 } });
        const { onTranslated } = renderModal();

        fireEvent.change(titleInput(), { target: { value: 'Valid title text' } });
        fireEvent.change(descriptionInput(), { target: { value: 'Valid description text' } });

        await waitFor(() => expect(saveButton()).not.toBeDisabled());
        fireEvent.click(saveButton());

        await waitFor(() => expect(MainPageLocalizationsApi.create).toHaveBeenCalled());

        expect(MainPageLocalizationsApi.create).toHaveBeenCalledWith(
            expect.any(Object),
            expect.objectContaining({
                entityId: 1,
                languageId: englishLanguage.id,
                title: '<p>Valid title text</p>',
                description: '<p>Valid description text</p>',
            }),
        );
        expect(onTranslated).toHaveBeenCalled();
    });

    it('updates existing localization and preserves other block values', async () => {
        (MainPageLocalizationsApi.getByLanguageId as jest.Mock).mockResolvedValue({
            entityId: 1,
            title: 'Existing title',
            description: 'Existing description',
            translationStatus: TranslationStatus.Relevant,
            localizationInfoDto: englishLanguage,
            mainAboutUs: null,
            mainPartners: {
                entityId: 20,
                title: 'Existing partners title',
                description: 'Existing partners description',
            },
        });

        renderModal({
            block: MainPageLocalizationBlock.AboutUs,
            page: {
                ...basePage,
                mainAboutUs: {
                    ...basePage.mainAboutUs!,
                    localizations: [
                        {
                            languageId: englishLanguage.id,
                            language: englishLanguage,
                            title: 'Old about title',
                            description: 'Old about description',
                            translationStatus: TranslationStatus.Relevant,
                        },
                    ],
                },
            },
        });

        fireEvent.change(titleInput(), { target: { value: 'Updated about title' } });
        fireEvent.change(descriptionInput(), { target: { value: 'Updated about description' } });

        await waitFor(() => expect(saveButton()).not.toBeDisabled());
        fireEvent.click(saveButton());

        await waitFor(() => expect(MainPageLocalizationsApi.update).toHaveBeenCalled());

        expect((MainPageLocalizationsApi.update as jest.Mock).mock.calls[0][3]).toEqual({
            title: 'Existing title',
            description: 'Existing description',
            mainAboutUs: {
                title: '<p>Updated about title</p>',
                description: '<p>Updated about description</p>',
            },
            mainPartners: {
                title: 'Existing partners title',
                description: 'Existing partners description',
            },
        });
    });

    it('shows save error when translation request fails', async () => {
        jest.spyOn(axios, 'isAxiosError').mockReturnValue(true);
        (MainPageLocalizationsApi.getByLanguageId as jest.Mock).mockRejectedValue({ response: { status: 404 } });
        (MainPageLocalizationsApi.create as jest.Mock).mockRejectedValue(new Error('save failed'));

        renderModal();

        fireEvent.change(titleInput(), { target: { value: 'Valid title text' } });
        fireEvent.change(descriptionInput(), { target: { value: 'Valid description text' } });

        await waitFor(() => expect(saveButton()).not.toBeDisabled());
        fireEvent.click(saveButton());

        expect(await screen.findByText('Помилка збереження перекладу')).toBeInTheDocument();
    });

    it('calls onClose immediately when X is clicked without dirty changes', () => {
        const { onClose } = renderModal();

        fireEvent.click(screen.getByLabelText('Close modal'));

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('uses dirty close confirmation when X is clicked after changes', async () => {
        const { onClose } = renderModal();

        fireEvent.change(titleInput(), { target: { value: 'Valid title text' } });
        fireEvent.click(screen.getByLabelText('Close modal'));

        expect(screen.getByText('Зміни будуть втрачені. Бажаєте продовжити?')).toBeInTheDocument();
        expect(onClose).not.toHaveBeenCalled();

        fireEvent.click(screen.getByText('Так'));

        await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    });
});
