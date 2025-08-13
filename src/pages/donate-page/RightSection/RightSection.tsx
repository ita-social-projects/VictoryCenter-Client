import React, { useState } from 'react';
import './RightSection.scss';

import { AbroadPaymentDetails } from './abroad-payment-details/AbroadPaymentDetails';
import { AlternativeSupportWays } from './alternative-support-ways/AlternativeSupportWays';
import { Tabs } from '../../../components/common/tabs/Tabs';
import { UkrainePaymentDetails } from './Ukraine-payment-details/UkrainePaymentDetails';
import { Currency } from '../../../types/public/donate-page/Currency';
import { CURRENCY_TABS } from '../../../const/donate-page/donate-page';

export const RightSection = () => {
    const [activeTab, setActiveTab] = useState<Currency>(Currency.UAH);

    const paymentDetails = () => {
        switch (activeTab) {
            case Currency.UAH:
                return <UkrainePaymentDetails />;
            case Currency.USD:
                return <AbroadPaymentDetails currency={activeTab} />;
            case Currency.EUR:
                return <AbroadPaymentDetails currency={activeTab} />;
        }
    };

    return (
        <div className="rightSection">
            <div className="locationToggleContainer">
                <label className="switch">
                    <Tabs
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        tabs={[
                            { id: Currency.UAH, label: CURRENCY_TABS.UAH },
                            { id: Currency.USD, label: CURRENCY_TABS.USD },
                            { id: Currency.EUR, label: CURRENCY_TABS.EUR },
                        ]}
                    ></Tabs>
                </label>
            </div>
            <div className="donatePaymentDetails">
                {paymentDetails()}
                <AlternativeSupportWays />
            </div>
        </div>
    );
};
