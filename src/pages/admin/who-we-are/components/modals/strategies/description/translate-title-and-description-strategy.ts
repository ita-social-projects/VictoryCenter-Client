import {
    TranslateWhoWeAreTitleAndDescriptionForm,
    TranslateWhoWeAreTitleAndDescriptionFormValues,
} from '../../forms/translate-title-and-description-form/TranslateWhoWeAreTitleAndDescriptionForm';
import { WhoWeAreModalStrategy } from '../who-we-are-modal-strategy';

export const translateTitleAndDescriptionStrategy: WhoWeAreModalStrategy<TranslateWhoWeAreTitleAndDescriptionFormValues> =
    {
        FormComponent: TranslateWhoWeAreTitleAndDescriptionForm,

        getInitialData: (section, language, isEditMode) => {
            if (!isEditMode || !language) return null;

            const localized = section.contents
                .flatMap((content) => content.localizations ?? [])
                .find((loc) => loc.language.code === language.code);

            return {
                title: localized?.title ?? '',
                description: localized?.description ?? '',
            };
        },

        submit: async (data, section, language) => {
            // TODO: API FOR SUBMIT
            console.log('save description translation', { data, sectionId: section.id, languageCode: language?.code });
        },
    };
