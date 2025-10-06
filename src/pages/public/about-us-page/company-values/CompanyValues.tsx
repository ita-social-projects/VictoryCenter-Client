import { ABOUT_US_DATA } from '../../../../const/public/about-us-page';
import { useState, useEffect } from 'react';
import './CompanyValues.scss';
import { CustomSwiper } from '../../../../components/public/swiper/CustomSwiper';

export const CompanyValues = () => {
    const [chunkedValues, setChunkedValues] = useState<(typeof ABOUT_US_DATA.VALUE_ITEMS)[]>([]);

    const chunkValues = (width: number) => {
        if (width >= 768 && width <= 911) {
            return ABOUT_US_DATA.VALUE_ITEMS.reduce(
                (acc, _, i) => {
                    if (i === 0 || i === acc.flat().length) {
                        const isFour = acc.length % 2 === 0;
                        const size = isFour ? 4 : 5;
                        acc.push(ABOUT_US_DATA.VALUE_ITEMS.slice(i, i + size));
                    }
                    return acc;
                },
                [] as (typeof ABOUT_US_DATA.VALUE_ITEMS)[],
            );
        } else {
            return ABOUT_US_DATA.VALUE_ITEMS.reduce(
                (acc, _, i) => {
                    if (i % 3 === 0) acc.push(ABOUT_US_DATA.VALUE_ITEMS.slice(i, i + 3));
                    return acc;
                },
                [] as (typeof ABOUT_US_DATA.VALUE_ITEMS)[],
            );
        }
    };

    useEffect(() => {
        const checkWidth = () => {
            const width = window.innerWidth;
            setChunkedValues(chunkValues(width));
        };
        checkWidth();
        window.addEventListener('resize', checkWidth);
        return () => window.removeEventListener('resize', checkWidth);
    }, []);

    return (
        <>
            <div className="values-block">
                <CustomSwiper
                    items={chunkedValues}
                    slidesPerView={1}
                    breakpoints={{
                        568: { slidesPerView: 2 },
                        768: { slidesPerView: 2 },
                        912: { slidesPerView: 3 },
                    }}
                    renderItem={(group, groupIndex) => (
                        <>
                            {groupIndex === 0 && (
                                <div className="values-title">
                                    <h2>{ABOUT_US_DATA.OUR_VALUES}</h2>
                                </div>
                            )}
                            <div className={`value-card card-${groupIndex + 1}`}>
                                {group.map((val, index) => (
                                    <div className="value-item" key={`${val.NAME}-${index}`}>
                                        <h3 className="value-name">{val.NAME}</h3>
                                        <div className="value-description">{val.DESCRIPTION}</div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                />
            </div>
        </>
    );
};
