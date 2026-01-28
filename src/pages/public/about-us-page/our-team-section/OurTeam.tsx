import styles from './OurTeam.module.scss';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import { AboutUsContent } from '@/types/public/about-us-page';
import { ContentType } from '@/types/common/about-us';
import { useTranslation } from 'react-i18next';
import defaultOurTeamImage from '@/assets/images/public/about-us-page/our-team.jpg';
import DOMPurify from 'dompurify';
import { Button } from '@/components/public/ui/button';

export interface OurTeamProps {
    content?: AboutUsContent[] | null;
}

export const OurTeam = ({ content }: OurTeamProps) => {
    const { t } = useTranslation('aboutUsPage');

    const imageUrl = content?.find((x) => x.contentType === ContentType.Image)?.image?.url ?? defaultOurTeamImage;
    const description = content?.find((x) => x.contentType === ContentType.Description)?.description ?? '';

    const sanitizedDescription =
        DOMPurify.sanitize(description ?? '', {
            ALLOWED_TAGS: ['p', 'strong', 'em', 'b', 'i', 'br'],
            ALLOWED_ATTR: [],
        }) || '';

    return (
        <div className={styles.root}>
            <img src={imageUrl} alt="Our Team" className={styles.image} />
            <div className={styles.info}>
                <p className={styles.description} dangerouslySetInnerHTML={{ __html: sanitizedDescription }} />
                <Button href={PUBLIC_ROUTES.TEAM.FULL} variant="tertiary">
                    {t('GO_TO_TEAM')}
                </Button>
            </div>
        </div>
    );
};
