import { useTranslation } from 'react-i18next';
import './CompanyValues.scss';

export const CompanyValues = () => {
    const { t } = useTranslation('aboutUsPage');
    const valueItems = t('VALUE_ITEMS', { returnObjects: true });

    const chunkedValues = valueItems.reduce(
        (acc, _, i) => {
            if (i % 3 === 0) acc.push(valueItems.slice(i, i + 3));
            return acc;
        },
        [] as (typeof valueItems)[],
    );

    return (
        <div className="values-block">
            <h2 className="values-title">{t('OUR_VALUES')}</h2>
            {chunkedValues.map((group, groupIndex) => (
                <div className="value-card" key={groupIndex}>
                    {group.map((val, index) => (
                        <div className="value-item" key={`${val.NAME}-${index}`}>
                            <h3 className="value-name">{val.NAME}</h3>
                            <div className="value-description">{val.DESCRIPTION}</div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};
