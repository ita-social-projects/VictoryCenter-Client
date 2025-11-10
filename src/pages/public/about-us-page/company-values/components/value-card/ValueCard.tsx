import { useTranslation } from 'react-i18next';
import { ValueItem } from '../../CompanyValues';

interface ValueGroupProps {
    group: ValueItem[];
    groupIndex: number;
}

export function ValueCard({ group, groupIndex }: ValueGroupProps) {
    const { t } = useTranslation('aboutUsPage');
    return (
        <>
            {groupIndex === 0 && (
                <div className="values-title">
                    <h2>{t('OUR_VALUES')}</h2>
                </div>
            )}
            <div className={`value-card card-${groupIndex + 1}`}>
                {group.map((val) => (
                    <div className="value-item" key={val.name}>
                        <h3 className="value-name">{val.name}</h3>
                        <div className="value-description">{val.description}</div>
                    </div>
                ))}
            </div>
        </>
    );
}
