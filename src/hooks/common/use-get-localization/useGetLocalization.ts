import { useMemo } from 'react';
import { useLocale } from '@/hooks/common/use-locale/useLocale';
import { EntityLocalization } from '@/types/common/language';

export const useGetLocalization = <T extends object>(
    localizations: EntityLocalization[] | undefined,
    fallback: T,
): T => {
    const { currentLanguage } = useLocale();

    return useMemo(() => {
        const activeLoc = localizations?.find((loc) => loc.language.code === currentLanguage);

        if (!activeLoc) {
            return fallback;
        }

        const { language: _language, translationStatus: _translationStatus, ...localizableFields } = activeLoc;

        return {
            ...fallback,
            ...localizableFields,
        };
    }, [currentLanguage, localizations, fallback]);
};
