import {
    TranslateWhoWeAreDescriptionForm,
    TranslateWhoWeAreDescriptionFormValues,
} from '../../forms/translate-description-form/TranslateWhoWeAreDescriptionForm';
import { WhoWeAreModalStrategy } from '../who-we-are-modal-strategy';

export const translateDescriptionStrategy: WhoWeAreModalStrategy<TranslateWhoWeAreDescriptionFormValues> = {
    FormComponent: TranslateWhoWeAreDescriptionForm,

    getInitialData: (section, language, isEditMode) => {
        if (!isEditMode || !language) return null;

        const localized = section.contents
            .flatMap((content) => content.localizations ?? [])
            .find((loc) => loc.language.code === language.code);

        return { description: localized?.description ?? '' };
    },
};
