import './company-values.scss';
import { OUR_VALUES, VALUE_ITEMS } from '../../../const/about-us-page/about-us-page';

export const CompanyValues = () => {
    const chunkedValues = VALUE_ITEMS.reduce(
        (acc, _, i) => {
            if (i % 3 === 0) acc.push(VALUE_ITEMS.slice(i, i + 3));
            return acc;
        },
        [] as (typeof VALUE_ITEMS)[],
    );

    return (
        <div className="values-block">
            <h2 className="values-title">{OUR_VALUES}</h2>
            {chunkedValues.map((group, groupIndex) => (
                <div className="value-card" key={groupIndex}>
                    {group.map((val, index) => (
                        <div className="value-item" key={val.name}>
                            <h3 className="value-name">{val.name}</h3>
                            <div className="value-description">{val.description}</div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};
