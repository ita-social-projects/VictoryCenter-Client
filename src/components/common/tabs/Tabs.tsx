import { TabProps } from '../../../types/public/donate-page';
import { NOT_AVAIBLE, CHECK_LATER } from '../../../const/public/tabs';
import styles from './Tabs.module.scss';

export const Tabs = ({ tabs, activeTab, setActiveTab }: TabProps) => {
    return (
        <div className={styles['tabsContainer']}>
            {tabs.map(({ id, label, disabled }) => {
                const isActive = activeTab === id;
                const tabClass = `tab ${isActive ? 'active' : ''}`;
                return disabled ? (
                    <div key={id} className="tooltip-container top">
                        <button className={tabClass} type="button" onClick={() => setActiveTab(id)} disabled>
                            {label}
                        </button>
                        <span className="tooltip-text">
                            <div className="text-center">
                                <p className="font-semibold">{NOT_AVAIBLE}</p>
                                <p>{CHECK_LATER}</p>
                            </div>
                        </span>
                    </div>
                ) : (
                    <button key={id} className={tabClass} type="button" onClick={() => setActiveTab(id)}>
                        {label}
                    </button>
                );
            })}
        </div>
    );
};
