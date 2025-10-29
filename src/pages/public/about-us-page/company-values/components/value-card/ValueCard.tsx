import { ABOUT_US_DATA } from '../../../../../../const/public/about-us-page';
import { ValueItem } from '../../CompanyValues';
interface ValueGroupProps {
    group: ValueItem[];
    groupIndex: number;
}
export function ValueCard({ group, groupIndex }: ValueGroupProps) {
    return (
        <>
            {groupIndex === 0 && (
                <div className="values-title">
                    <h2>{ABOUT_US_DATA.OUR_VALUES}</h2>
                </div>
            )}
            <div className={`value-card card-${groupIndex + 1}`}>
                {group.map((val, index) => (
                    <div className="value-item" key={index}>
                        <h3 className="value-name">{val.NAME}</h3>
                        <div className="value-description">{val.DESCRIPTION}</div>
                    </div>
                ))}
            </div>
        </>
    );
}
