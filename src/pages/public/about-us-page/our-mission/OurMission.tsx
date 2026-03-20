import { ReactComponent as ArrowIcon } from '@/assets/icons/arrow-up-right.svg';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import { AboutUsContent } from '@/types/public/about-us-page';
import { ContentType } from '@/types/common/about-us';
import { useTranslation } from 'react-i18next';
import styles from './OurMission.module.scss';
import { Button } from '@/components/public/ui/button';
import { SafeHtml } from '@/components/common/safe-html';
import { useGetLocalization } from '@/hooks/common/use-get-localization/useGetLocalization';

export interface OurMissionProps {
    content?: AboutUsContent[] | null;
    description?: string;
    className?: string;
}

export const OurMission = ({ content, description }: OurMissionProps) => {
    const { t } = useTranslation('aboutUsPage');

    const descriptionContent = content?.find((x) => x.contentType === ContentType.Description);

    const { description: descriptionValue } = useGetLocalization(descriptionContent?.localizations, {
        description: descriptionContent?.description ?? '',
    });

    const finalDescription = description ?? descriptionValue;

    return (
        <div className={styles.root}>
            <h2 className={styles.title}>{t('WHAT_WE_DO')}</h2>
            <div className={styles.block}>
                <SafeHtml as="p" className={styles.text} html={finalDescription} />
                <div className={styles.actions}>
                    <Button href={PUBLIC_ROUTES.PROGRAMS.FULL} icon={ArrowIcon} iconPosition="right" variant="tertiary">
                        {t('GO_TO_PROGRAMS')}
                    </Button>
                </div>
            </div>
        </div>
    );
};
