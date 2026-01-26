import { NavLink } from 'react-router-dom';
import { ReactComponent as ArrowIcon } from '@/assets/icons/arrow-up-right.svg';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import classNames from 'classnames';
import { AboutUsContent } from '@/types/public/about-us-page';
import { ContentType } from '@/types/common/about-us';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';
import './OurMission.scss';

export interface OurMissionProps {
    content?: AboutUsContent[] | null;
    description?: string;
    navigate?: boolean;
    className?: string;
}

export const OurMission = ({ content, description, className, navigate = true }: OurMissionProps) => {
    const { t } = useTranslation('aboutUsPage');

    const descriptionValue = content?.find((x) => x.contentType === ContentType.Description)?.description ?? '';

    const sanitizedDescription =
        DOMPurify.sanitize(description ?? descriptionValue ?? '', {
            ALLOWED_TAGS: ['p', 'strong', 'em', 'b', 'i', 'br'],
            ALLOWED_ATTR: [],
        }) || '';

    const linkContent = (
        <div className="link-block">
            <span className="link-title">{t('GO_TO_PROGRAMS')}</span>
            <ArrowIcon className="arrow-icon" />
        </div>
    );

    return (
        <div className={classNames('our-mission-block', className)}>
            <div className="what-we-do">
                <h2 className="mission-title">{t('WHAT_WE_DO')}</h2>
                <div className="details-block">
                    <p className="mission-details" dangerouslySetInnerHTML={{ __html: sanitizedDescription }} />
                    {navigate ? (
                        <NavLink to={PUBLIC_ROUTES.PROGRAMS.FULL} className="link-to-programs">
                            {linkContent}
                        </NavLink>
                    ) : (
                        <span className="link-to-programs">{linkContent}</span>
                    )}
                </div>
            </div>
        </div>
    );
};
