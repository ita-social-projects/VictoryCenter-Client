import { TabProps } from '../../../types/public/donate-page/DonateTab';
import './Tabs.scss';

export const Tabs = ({ tabs, activeTab, setActiveTab }: TabProps) => {
    return (
        <div className="tabsContainer">
            {tabs.map(({ id, label, disabled }, index) => {
                const isActive = activeTab === index;
                const tabClass = `tab ${isActive ? 'active' : ''}`;
                return disabled ? (
                    <div key={id} className="tooltip-container top">
                        <button className={tabClass} type="button" onClick={() => setActiveTab(id)} disabled>
                            {label}
                        </button>
                        <span className="tooltip-text">
                            <div className="text-center">
                                <p className="font-semibold">Not yet available.</p>
                                <p>Please check back later!</p>
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
