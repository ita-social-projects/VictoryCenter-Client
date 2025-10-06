import './SupportSection.scss';
import { ABOUT_US_DATA } from '../../../../const/public/about-us-page';
import { useState, useEffect } from 'react';
import { SupportSectionResponsive } from './responsive/SupportSectionResponsive';
import { CustomSwiper } from '../../../../components/public/swiper/CustomSwiper';
import { AboutUsContent } from '../../../../types/public/about-us-page';

export interface SupportSectionProps {
    content: AboutUsContent[] | null;
}

export const SupportSection = ({ content }: SupportSectionProps) => {
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
                <SupportSectionResponsive content={content} />
            ) : (
                <div className="support-block">
                    <CustomSwiper
                        items={content}
                        slidesPerView={1}
                        breakpoints={{
                            912: { slidesPerView: 3 },
                        }}
                        renderItem={(item, index) => {
                            const imageUrl = item.image?.url ?? ABOUT_US_DATA.SUPPORT_DATA[index].IMG;
                            const altText = ABOUT_US_DATA.SUPPORT_DATA[index].ALT;
                            const description = item.description;

                            return (
                                <>
                                    {index === 0 && (
                                        <div className="main-values-title">
                                            <h2 className="support-title">{ABOUT_US_DATA.SUPPORT_TITLE}</h2>
                                        </div>
                                    )}
                                    <div className={`support-card card-${index + 1}`}>
                                        <img src={imageUrl} alt={altText} />
                                        <p className="support-description">{description}</p>
                                    </div>
                                </>
                            );
                        }}
                    />
                </div>
            )}
        </>
    );
};
