import { useState, useEffect } from 'react';
import './RightSection.scss';

import { AbroadPaymentDetails } from './abroad-payment-details/AbroadPaymentDetails';
import { AlternativeSupportWays } from './alternative-support-ways/AlternativeSupportWays';
import { Tabs } from '../../../../components/common/tabs/Tabs';
import { UkrainePaymentDetails } from './ukraine-payment-details/UkrainePaymentDetails';
import { Currency, DonatePageData } from '../../../../types/public/donate-page';
import { CURRENCY_TABS, ERROR_MESSAGES } from '../../../../const/public/donate-page';

interface RightSectionProps {
    donateData: DonatePageData | null;
    error?: string | null;
}

export const RightSection = ({ donateData, error }: RightSectionProps) => {
    const getAvailableCurrencies = () => {
        if (!donateData) return [];

        const availableCurrencies: Currency[] = [];

        if (
            donateData.uahBankDetails.length > 0 ||
            donateData.supportOptions.some((s) => s.currency === Currency.UAH)
        ) {
            availableCurrencies.push(Currency.UAH);
        }

        const usdBankDetails = donateData.foreignBankDetails.filter((b) => b.currency === Currency.USD);
        const usdSupportOptions = donateData.supportOptions.filter((s) => s.currency === Currency.USD);
        if (usdBankDetails.length > 0 || usdSupportOptions.length > 0) {
            availableCurrencies.push(Currency.USD);
        }

        const eurBankDetails = donateData.foreignBankDetails.filter((b) => b.currency === Currency.EUR);
        const eurSupportOptions = donateData.supportOptions.filter((s) => s.currency === Currency.EUR);
        if (eurBankDetails.length > 0 || eurSupportOptions.length > 0) {
            availableCurrencies.push(Currency.EUR);
        }

        return availableCurrencies;
    };

    const availableCurrencies = getAvailableCurrencies();
    const [activeTab, setActiveTab] = useState<Currency>(availableCurrencies[0] || Currency.UAH);

    useEffect(() => {
        if (availableCurrencies.length > 0 && !availableCurrencies.includes(activeTab)) {
            setActiveTab(availableCurrencies[0]);
        }
    }, [availableCurrencies, activeTab]);

    const paymentDetails = () => {
        if (!donateData) return null;

        switch (activeTab) {
            case Currency.UAH:
                return <UkrainePaymentDetails bankDetails={donateData.uahBankDetails} />;
            case Currency.USD:
                return (
                    <AbroadPaymentDetails
                        currency={activeTab}
                        foreignBankDetails={donateData.foreignBankDetails.filter((b) => b.currency === Currency.USD)}
                    />
                );
            case Currency.EUR:
                return (
                    <AbroadPaymentDetails
                        currency={activeTab}
                        foreignBankDetails={donateData.foreignBankDetails.filter((b) => b.currency === Currency.EUR)}
                    />
                );
        }
    };

    if (error) {
        return (
            <div className="donate-error-message" role="alert">
                {ERROR_MESSAGES.LOADING_ERROR}
            </div>
        );
    }

    if (availableCurrencies.length === 0) {
        return null;
    }

    const tabs = availableCurrencies.map((currency) => ({
        id: currency,
        label: CURRENCY_TABS[Currency[currency] as keyof typeof CURRENCY_TABS],
    }));

    return (
        <div className="rightSection">
            <div className="locationToggleContainer">
                <div className="switch">
                    <Tabs activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />
                </div>
            </div>
            <div className="donatePaymentDetails">
                {paymentDetails()}
                <AlternativeSupportWays supportOptions={donateData?.supportOptions || []} currentCurrency={activeTab} />
            </div>
        </div>
    );
};
