import { useMemo } from 'react';
import { useLocale } from '@/hooks/common/use-locale/useLocale';

export const useGetLocalization = <T extends object, L extends { language: { code: string } }>(
    localizations: L[] | undefined,
    fallback: T,
): T => {
    const { currentLanguage } = useLocale();

    return useMemo(() => {
        const activeLoc = localizations?.find((loc) => loc.language.code === currentLanguage);

        if (!activeLoc) {
            return fallback;
        }

        const { language: _language, translationStatus: _translationStatus, ...localizableFields } = activeLoc as any;

        return {
            ...fallback,
            ...localizableFields,
        };
    }, [currentLanguage, localizations, fallback]);
};
