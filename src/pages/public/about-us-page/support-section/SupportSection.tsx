import { useTranslation } from 'react-i18next';
import { SupportSectionTablet } from './components/support-section-tablet/SupportSectionTablet';
import { CustomSwiper } from '../../../../components/public/swiper/CustomSwiper';
import useMediaQuery from '@mui/material/useMediaQuery';
import { SupportCard } from './components/support-card/SupportCard';
import { AboutUsContent } from '../../../../types/public/about-us-page';
import './SupportSection.scss';

export interface SupportSectionProps {
    content: AboutUsContent[] | null;
}

export const SupportSection = ({ content }: SupportSectionProps) => {
    const { t } = useTranslation('aboutUsPage');
    const isTablet = useMediaQuery('(min-width:768px) and (max-width:1024px)');

    return (
        <div className="support-block">
            {isTablet ? (
                <SupportSectionTablet content={content} />
            ) : (
                <CustomSwiper
                    items={content}
                    slidesPerView={1}
                    breakpoints={{
                        1025: { slidesPerView: 3 },
                    }}
                    renderItem={(item, index) => {
                        return (
                            <>
                                {index === 0 && (
                                    <div className="main-values-title">
                                        <h2 className="support-title">{t('SUPPORT_TITLE')}</h2>
                                    </div>
                                )}
                                <SupportCard card={item} index={index} />
                            </>
                        );
                    }}
                />
            )}
        </div>
    );
};
