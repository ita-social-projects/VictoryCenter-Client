import { PublicMainAboutUsDto } from '@/types/public/main-page';
import { SafeHtml } from '@/components/common/safe-html';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/common/use-locale/useLocale';
import { useNavigate } from 'react-router-dom';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import { Button } from '@/components/public/ui/button/Button';
import { ReactComponent as ArrowIcon } from '@/assets/icons/arrow-up-right.svg';

import styles from './AboutUsSection.module.scss';

interface PublicMainAboutUsProps {
    mainAboutUs: PublicMainAboutUsDto | null | undefined;
}

const getLocalizedAboutUsTitle = (mainAboutUs: PublicMainAboutUsDto, currentLanguage: string): string => {
    const loc = mainAboutUs.localizations?.find((l) => l.localizationInfoDto?.code === currentLanguage);
    return loc?.title ?? mainAboutUs.title ?? '';
};

const getLocalizedAboutUsDescription = (mainAboutUs: PublicMainAboutUsDto, currentLanguage: string): string => {
    const loc = mainAboutUs.localizations?.find((l) => l.localizationInfoDto?.code === currentLanguage);
    return loc?.description ?? mainAboutUs.description ?? '';
};

export const AboutUsSection = ({ mainAboutUs }: PublicMainAboutUsProps) => {
    const { t } = useTranslation('mainPage');
    const { currentLanguage } = useLocale();
    const navigate = useNavigate();

    const title = mainAboutUs ? getLocalizedAboutUsTitle(mainAboutUs, currentLanguage) : '';
    const description = mainAboutUs ? getLocalizedAboutUsDescription(mainAboutUs, currentLanguage) : '';

    return (
        <section className={styles.root}>
            {title && <SafeHtml as="h2" className={styles.title} html={title} />}

            <div className={styles['description-content']}>
                {description && <SafeHtml as="p" className={styles.description} html={description} />}
                <Button
                    onClick={() => navigate(PUBLIC_ROUTES.ABOUT_US.FULL)}
                    icon={ArrowIcon}
                    iconPosition="right"
                    variant="tertiary"
                >
                    {t('LINK_TO_MORE')}
                </Button>
            </div>
        </section>
    );
};
