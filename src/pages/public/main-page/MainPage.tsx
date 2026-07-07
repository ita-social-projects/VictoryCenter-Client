import { LinearProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import fallbackImage from '@/assets/images/group-riding-horses.webp';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { useLocale } from '@/hooks/common/use-locale/useLocale';
import { PublicMainPageApi } from '@/services/api/public/main-page/main-page-api';
import { PublicMainPageDto, PublicMainPageLocalizationDto, MainIntroData } from '@/types/public/main-page';
import { getImageSrc } from '@/utils/functions/image-helper/image-helper';
import { IntroSection } from './intro-section/IntroSection';
import { MainProgramsSection } from './main-programs-section/MainProgramsSection';
import { MainStatisticsSection } from './main-statistics-section/MainStatisticsSection';
import styles from './MainPage.module.scss';

const getFilledText = (...values: Array<string | null | undefined>): string => {
    return values.find((value) => value?.trim())?.trim() ?? '';
};

const getCurrentLocalization = (
    localizations: PublicMainPageLocalizationDto[] | undefined,
    currentLanguage: string,
): PublicMainPageLocalizationDto | undefined => {
    return localizations?.find((localization) => localization.localizationInfoDto.code === currentLanguage);
};

export const MainPage = () => {
    const { t } = useTranslation('mainPage');
    const { currentLanguage } = useLocale();
    const {
        data: mainPageData,
        isLoading,
        error,
    } = useDataFetch<PublicMainPageDto | null>({
        initialData: null,
        fetchHandler: PublicMainPageApi.get,
        autoFetchDependencies: [currentLanguage],
    });

    if (isLoading) {
        return (
            <div className={styles.loader}>
                <LinearProgress />
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.error}>
                <p>{t('DOWNLOAD_ERROR')}</p>
            </div>
        );
    }

    const currentLocalization = getCurrentLocalization(mainPageData?.localizations, currentLanguage);
    const imageSrc = getImageSrc(mainPageData?.image) || fallbackImage;
    const introData: MainIntroData = {
        title: getFilledText(currentLocalization?.title, mainPageData?.title, t('INTRO.TITLE')),
        description: getFilledText(currentLocalization?.description, mainPageData?.description, t('INTRO.DESCRIPTION')),
        buttonText: t('INTRO.BUTTON'),
        image: imageSrc,
    };

    return (
        <div className={styles.page}>
            <IntroSection introData={introData} buttonHref={PUBLIC_ROUTES.PROGRAMS.FULL} />
            <MainProgramsSection />
            <MainStatisticsSection impactStatistics={mainPageData?.impactStatistics} />
        </div>
    );
};
