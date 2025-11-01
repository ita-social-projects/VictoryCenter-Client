import { useTranslation } from 'react-i18next';
import { ABOUT_US_DATA } from '../../../../const/public/about-us-page';
import { SupportSectionTablet } from './components/support-section-tablet/SupportSectionTablet';
import { Swiper } from '../../../../components/public/swiper/Swiper';
import useMediaQuery from '@mui/material/useMediaQuery';
import { SupportCard } from './components/support-card/SupportCard';
import './SupportSection.scss';
import { AboutUsContent } from '../../../../types/public/about-us-page';

export interface SupportSectionProps {
    content: AboutUsContent[] | null;
}

export const SupportSection = ({ content }: SupportSectionProps) => {
    const { t } = useTranslation('aboutUsPage');

    const isTablet = useMediaQuery('(min-width:768px) and (max-width:1024px)');

    if (isTablet) return <SupportSectionTablet content={content} />;

    return (
        <div className="support-block">
            <Swiper
                items={content}
                slidesPerView={1}
                breakpoints={{
                    1025: { slidesPerView: 3 },
                }}
                renderItem={(item, index) => (
                    <>
                        {index === 0 && (
                            <div className="main-values-title">
                                <h2 className="support-title">{t('SUPPORT_TITLE')}</h2>
                            </div>
                        )}
							 <SupportCard card={item} index={index} />
                    </>
                )}
            />
        </div>
    );
};
