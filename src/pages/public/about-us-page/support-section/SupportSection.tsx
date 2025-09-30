import './SupportSection.scss';
import { ABOUT_US_DATA } from '../../../../const/public/about-us-page';
import { useState, useEffect } from 'react';
import { SupportSectionResponsive } from './responsive/SupportSectionResponsive';
import { CustomSwiper } from '../../../../components/public/swiper/CustomSwiper';

export const SupportSection = () => {
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        const checkWidth = () => {
            const width = window.innerWidth;
            setIsVisible(width >= 568 && width <= 912);
        };
        checkWidth();
        window.addEventListener('resize', checkWidth);
        return () => window.removeEventListener('resize', checkWidth);
    }, []);

    return (
        <>
            {isVisible ? (
                <SupportSectionResponsive />
            ) : (
                <div className="support-block">
                    <CustomSwiper
                        items={ABOUT_US_DATA.SUPPORT_DATA}
                        slidesPerView={1}
                        breakpoints={{
                            912: { slidesPerView: 3 },
                        }}
                        renderItem={(item, index) => (
                            <>
                                {index === 0 && (
                                    <div className="main-values-title">
                                        <h2 className="support-title">{ABOUT_US_DATA.SUPPORT_TITLE}</h2>
                                    </div>
                                )}
                                <div className={`support-card card-${index + 1}`}>
                                    <img src={item.IMG} alt={item.ALT} />
                                    <p className="support-description">{item.DESCRIPTION}</p>
                                </div>
                            </>
                        )}
                    />
                </div>
            )}
        </>
    );
};
