import React, { useState } from 'react';
import './RightSection.scss';

import { AbroadPaymentDetails } from './abroad-payment-details/AbroadPaymentDetails';
import { AlternativeSupportWays } from './alternative-support-ways/AlternativeSupportWays';
import { Tabs } from '../../../components/common/tabs/Tabs';
import { CurrencyTab } from '../../../types/public/donate-page/DonateTab';
import { CURRENCY, CURRENCY_TABS } from '../../../const/donate-page/donate-page';
import { UkrainePaymentDetails } from './Ukraine-payment-details/UkrainePaymentDetails';

export const RightSection = () => {
    const [activeTab, setActiveTab] = useState<CurrencyTab>(CurrencyTab.uah);

    const paymentDetails = () => {
        switch (activeTab) {
            case CurrencyTab.uah:
                return <UkrainePaymentDetails />;
            case CurrencyTab.usd:
                return <AbroadPaymentDetails currency={CURRENCY.USD} />;
            case CurrencyTab.eur:
                return <AbroadPaymentDetails currency={CURRENCY.EUR} />;
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
                            { id: CurrencyTab.uah, label: CURRENCY_TABS.UAH },
                            { id: CurrencyTab.usd, label: CURRENCY_TABS.USD },
                            { id: CurrencyTab.eur, label: CURRENCY_TABS.EUR },
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
