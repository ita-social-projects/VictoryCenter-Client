import { EntityLocalization, LocalizationLanguage } from '@/types/common/language';

interface LocalizationStatusesMockProps {
    languages?: LocalizationLanguage[];
    localizedEntity?: { localizations?: EntityLocalization[] };
}

export const LocalizationStatuses = ({ languages, localizedEntity }: LocalizationStatusesMockProps) => (
    <div
        data-testid="localization-statuses"
        data-languages-count={languages?.length ?? 0}
        data-localizations-count={localizedEntity?.localizations?.length ?? 0}
    />
);
