import { ContentType } from '@/types/common/about-us';
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

            const titleContent = section.contents
                .find((content) => content.contentType === ContentType.Title);
            const descriptionContent = section.contents
                .find((content) => content.contentType === ContentType.Description);

            return {
                title: titleContent?.localizations?.find((loc) => loc.language.code === language.code)?.title ?? '',
                description: descriptionContent?.localizations?.find((loc) => loc.language.code === language.code)?.description ?? '',
            };
        },
    };
