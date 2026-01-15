import { useMemo } from 'react';
import { useLocale } from '@/hooks/common/use-locale/useLocale';
import { EntityLocalizationDto } from '@/types/common/language';

export const useGetLocalization = <T extends object>(
    localizations: EntityLocalizationDto[] | undefined,
    fallback: T,
): T => {
    const { currentLanguage } = useLocale();

    return useMemo(() => {
        const activeLoc = localizations?.find((loc) => loc.localizationInfoDto.code === currentLanguage);

        if (!activeLoc) {
            return fallback;
        }

        const {
            localizationInfoDto: _localizationInfoDto,
            translationStatus: _translationStatus,
            ...localizableFields
        } = activeLoc;

        return {
            ...fallback,
            ...localizableFields,
        };
    }, [currentLanguage, localizations, fallback]);
};
