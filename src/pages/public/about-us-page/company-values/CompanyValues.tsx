import { ABOUT_US_DATA } from '../../../../const/public/about-us-page';
import './CompanyValues.scss';

export const CompanyValues = () => {
    const chunkedValues = ABOUT_US_DATA.VALUE_ITEMS.reduce(
        (acc, _, i) => {
            if (i % 3 === 0) acc.push(ABOUT_US_DATA.VALUE_ITEMS.slice(i, i + 3));
            return acc;
        },
        [] as (typeof ABOUT_US_DATA.VALUE_ITEMS)[],
    );

    return (
        <div className="values-block">
            <h2 className="values-title">{ABOUT_US_DATA.OUR_VALUES}</h2>
            {chunkedValues.map((group, groupIndex) => (
                <div className="value-card" key={groupIndex}>
                    {group.map((val, index) => (
                        <div className="value-item" key={val.NAME}>
                            <h3 className="value-name">{val.NAME}</h3>
                            <div className="value-description">{val.DESCRIPTION}</div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};
