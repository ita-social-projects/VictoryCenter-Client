import { ABOUT_US_DATA } from '../../../../../const/public/about-us-page';
import { CustomSwiper } from '../../../../../components/public/swiper/CustomSwiper';

export const CompanyValues768px = () => {
    const chunkedValues = ABOUT_US_DATA.VALUE_ITEMS.reduce(
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
    return (
        <div className="values-block">
            <CustomSwiper
                items={chunkedValues}
                slidesPerView={2}
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
    );
};
