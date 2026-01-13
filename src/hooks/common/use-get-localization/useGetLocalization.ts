import { useMemo } from 'react';
import { useLocale } from '@/hooks/common/use-locale/useLocale';
import { EntityLocalizationDto } from '@/types/common/language';

export const useGetLocalization = <T>(localizations: EntityLocalizationDto[] | undefined, fallback: T): T => {
    const { currentLanguage } = useLocale();

    return useMemo(() => {
        const activeLoc = localizations?.find((loc) => loc.localizationInfoDto.code === currentLanguage);

        return {
            ...fallback,
            ...activeLoc,
        };
    }, [currentLanguage, localizations, fallback]);
};
