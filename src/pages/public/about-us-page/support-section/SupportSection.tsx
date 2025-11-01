import { useTranslation } from 'react-i18next';
import { ABOUT_US_DATA } from '../../../../const/public/about-us-page';
import { SupportSectionTablet } from './components/support-section-tablet/SupportSectionTablet';
import { Swiper } from '../../../../components/public/swiper/Swiper';
import useMediaQuery from '@mui/material/useMediaQuery';
import { SupportCard } from './components/support-card/SupportCard';
import './SupportSection.scss';
export const SupportSection = () => {
    const { t } = useTranslation('aboutUsPage');
    const supportData = t('SUPPORT_DATA', { returnObjects: true });

    const isTablet = useMediaQuery('(min-width:768px) and (max-width:1024px)');

    if (isTablet) return <SupportSectionTablet />;

    return (
        <div className="support-block">
            <Swiper
                items={supportData}
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
                        <SupportCard
                            img={ABOUT_US_DATA.SUPPORT_DATA[index].IMG}
                            alt={item.ALT}
                            description={item.DESCRIPTION}
                            index={index}
                        />
                    </>
                )}
            />
        </div>
    );
};
