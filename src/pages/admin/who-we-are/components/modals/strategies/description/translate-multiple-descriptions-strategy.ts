import { getImageSrc } from '@/utils/functions/image-helper/image-helper';
import {
    TranslateWhoWeAreMultipleDescriptionsForm,
    TranslateWhoWeAreMultipleDescriptionsFormValues,
} from '../../forms/translate-multiple-descriptions-form/TranslateWhoWeAreMultipleDescriptionsForm';
import { WhoWeAreModalStrategy } from '../who-we-are-modal-strategy';
import { SectionType } from '@/types/common/about-us';
import SupportVeterans from '@/assets/images/public/about-us-page/support-veterans.jpg';
import SupportVolunteers from '@/assets/images/public/about-us-page/support-volunteers.jpg';
import SupportChildren from '@/assets/images/public/about-us-page/support-children.jpg';
import ManAndHorse from '@/assets/images/public/about-us-page/man-horse.jpg';
import GirlAndHorse from '@/assets/images/public/about-us-page/girl-horse.jpg';
import OldManAndHorse from '@/assets/images/public/about-us-page/old-man-horse.jpg';
import WomanAndHorse from '@/assets/images/public/about-us-page/woman-horse.jpg';

export const translateMultipleDescriptionsStrategy: WhoWeAreModalStrategy<TranslateWhoWeAreMultipleDescriptionsFormValues> =
    {
        FormComponent: TranslateWhoWeAreMultipleDescriptionsForm,

        getInitialData: (section, language, isEditMode) => {
            if (!language) return null;

            let defaultImagesForSection: string[];
            switch (section.sectionType) {
                case SectionType.WhoWeSupport:
                    defaultImagesForSection = [SupportVeterans, SupportVolunteers, SupportChildren];
                    break;
                case SectionType.People:
                    defaultImagesForSection = [ManAndHorse, GirlAndHorse, OldManAndHorse, WomanAndHorse];
                    break;
            }

            return {
                rows: section.contents.map((content, index) => {
                    const localization = content.localizations?.find((loc) => loc.language.code === language.code);

                    return {
                        contentId: content.id,
                        image: content.image ? getImageSrc(content.image) : defaultImagesForSection[index],
                        description: isEditMode ? (localization?.description ?? '<p><br></p>') : '<p><br></p>',
                    };
                }),
            };
        },
    };
