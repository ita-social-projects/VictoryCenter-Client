import './SupportSection.scss';
import { ABOUT_US_DATA } from '../../../../const/public/about-us-page';
import { SupportSectionTablet } from './components/support-section-tablet/SupportSectionTablet';
import { CustomSwiper } from '../../../../components/public/swiper/CustomSwiper';
import useMediaQuery from '@mui/material/useMediaQuery';
import { SupportCard } from './components/support-card/SupportCard';

export const SupportSection = () => {
    const isTablet = useMediaQuery('(min-width:768px) and (max-width:1024px)');

    return (
        <div className="support-block">
            {isTablet ? (
                <SupportSectionTablet />
            ) : (
                <CustomSwiper
                    items={ABOUT_US_DATA.SUPPORT_DATA}
                    slidesPerView={1}
                    breakpoints={{
                        1025: { slidesPerView: 3 },
                    }}
                    renderItem={(item, index) => (
                        <>
                            {index === 0 && (
                                <div className="main-values-title">
                                    <h2 className="support-title">{ABOUT_US_DATA.SUPPORT_TITLE}</h2>
                                </div>
                            )}
                            <SupportCard IMG={item.IMG} ALT={item.ALT} DESCRIPTION={item.DESCRIPTION} index={index} />
                        </>
                    )}
                />
            )}
        </div>
    );
};
