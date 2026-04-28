import styles from './OurTeam.module.scss';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import { AboutUsContent } from '@/types/public/about-us-page';
import { ContentType } from '@/types/common/about-us';
import { useTranslation } from 'react-i18next';
import defaultOurTeamImage from '@/assets/images/our-team.webp';
import { Button } from '@/components/public/ui/button';
import { SafeHtml } from '@/components/common/safe-html';
import { useGetLocalization } from '@/hooks/common/use-get-localization/useGetLocalization';
import { getImageSrc } from '@/utils/functions/image-helper/image-helper';

export interface OurTeamProps {
    content?: AboutUsContent[] | null;
}

export const OurTeam = ({ content }: OurTeamProps) => {
    const { t } = useTranslation('aboutUsPage');

    const imageUrl =
        getImageSrc(content?.find((x) => x.contentType === ContentType.Image)?.image) || defaultOurTeamImage;

    const descriptionContent = content?.find((x) => x.contentType === ContentType.Description);
    const { description } = useGetLocalization(descriptionContent?.localizations, {
        description: descriptionContent?.description,
    });

    return (
        <div className={styles.root}>
            <img src={imageUrl} alt="Our Team" className={styles.image} />
            <div className={styles.info}>
                <SafeHtml as="p" className={styles.description} html={description ?? ''} />
                <Button href={PUBLIC_ROUTES.TEAM.FULL} variant="tertiary">
                    {t('GO_TO_TEAM')}
                </Button>
            </div>
        </div>
    );
};
