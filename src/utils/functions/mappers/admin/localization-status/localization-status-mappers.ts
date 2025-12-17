import { LOCALIZATION_TEXT } from '../../../../../const/admin/localization';
import { TranslationStatusFilter } from '../../../../../types/common/language';

const TranslationStatusLabels = [
    LOCALIZATION_TEXT.FILTER.STATUS.ALL,
    LOCALIZATION_TEXT.FILTER.STATUS.OUTDATED,
    LOCALIZATION_TEXT.FILTER.STATUS.MISSING,
] as const;

export const mapLabelToTranslationStatusFilter = (label: string): TranslationStatusFilter | undefined => {
    const index = TranslationStatusLabels.indexOf(label as (typeof TranslationStatusLabels)[number]);
    return index === -1 ? undefined : index;
};
