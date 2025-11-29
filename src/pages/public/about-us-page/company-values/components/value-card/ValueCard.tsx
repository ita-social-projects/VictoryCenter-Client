import { useTranslation } from 'react-i18next';
import { ValueItem } from '../../CompanyValues';

interface ValueGroupProps {
    group: ValueItem[];
    groupIndex: number;
    stylesModule: Record<string, string>;
}

export function ValueCard({ group, groupIndex, stylesModule }: ValueGroupProps) {
    const { t } = useTranslation('aboutUsPage');

    return (
        <>
            {groupIndex === 0 && (
                <div className={stylesModule['values-title']}>
                    <h2>{t('OUR_VALUES')}</h2>
                </div>
            )}
            <div className={`${stylesModule['value-card']} ${stylesModule[`card-${groupIndex + 1}`]}`}>
                {group.map((val) => (
                    <div className={stylesModule['value-item']} key={val.name}>
                        <h3 className={stylesModule['value-name']}>{val.name}</h3>
                        <div className={stylesModule['value-description']}>{val.description}</div>
                    </div>
                ))}
            </div>
        </>
    );
}
