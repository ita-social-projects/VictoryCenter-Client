import { useCallback, useState } from 'react';
import { LOCALIZATION_TEXT } from '@/const/admin/localization';
import { Select } from '@/components/common/select/Select';
import { LocalizationLanguage, TranslationStatusFilter } from '@/types/common/language';
import { mapLabelToTranslationStatusFilter } from '@/utils/functions/mappers/admin/localization-status/localization-status-mappers';
import styles from './LocalizationToolkit.module.scss';
import { LanguageToolkit } from '@/components/admin/language-toolkit/LanguageToolkit';

export interface LocalizationToolkitProps {
    languages: LocalizationLanguage[];
    onLanguageChange: (language: LocalizationLanguage) => void;
    onTranslationStatusFilterChange: (translationFilter: TranslationStatusFilter | undefined) => void;
}

export const LocalizationToolkit = ({
    languages,
    onLanguageChange,
    onTranslationStatusFilterChange,
}: LocalizationToolkitProps) => {
    const [selectedTranslationStatus, setSelectedTranslationStatus] = useState<TranslationStatusFilter | undefined>();

    const changeTranslationStatus = useCallback(
        (translationFilter: TranslationStatusFilter | undefined) => {
            setSelectedTranslationStatus(translationFilter);
            onTranslationStatusFilterChange(translationFilter);
        },
        [onTranslationStatusFilterChange],
    );

    return (
        <div className={styles.toolkit} data-testid="localization-toolkit">
            <LanguageToolkit languages={languages} onLanguageChange={onLanguageChange} />
            <Select<TranslationStatusFilter>
                value={selectedTranslationStatus}
                onValueChange={changeTranslationStatus}
                placeholder={LOCALIZATION_TEXT.TRANSLATIONS}
            >
                {Object.entries(LOCALIZATION_TEXT.FILTER.STATUS).map(([, value], index) => (
                    <Select.Option key={index} value={mapLabelToTranslationStatusFilter(value)} name={value} />
                ))}
            </Select>
        </div>
    );
};
