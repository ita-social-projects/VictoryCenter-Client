import { getImageSrc } from '@/utils/functions/image-helper/image-helper';
import {
    TranslateWhoWeAreMultipleDescriptionsForm,
    TranslateWhoWeAreMultipleDescriptionsFormValues,
} from '../../forms/translate-multiple-descriptions-form/TranslateWhoWeAreMultipleDescriptionsForm';
import { WhoWeAreModalStrategy } from '../who-we-are-modal-strategy';
import { SectionType } from '@/types/common/about-us';
import SupportVeterans from '@/assets/images/support-veterans.webp';
import SupportVolunteers from '@/assets/images/support-volunteers.webp';
import SupportChildren from '@/assets/images/support-children.webp';
import ManAndHorse from '@/assets/images/man-horse.webp';
import GirlAndHorse from '@/assets/images/girl-horse.webp';
import OldManAndHorse from '@/assets/images/old-man-horse.webp';
import WomanAndHorse from '@/assets/images/woman-horse.webp';

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
                default:
                    defaultImagesForSection = [];
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
