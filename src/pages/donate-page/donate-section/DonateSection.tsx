import './DonateSection.scss';
import React, { useState } from 'react';
import {
    ONE_TIME_DONATE_BUTTON_LABEL,
    ONE_TIME_DONATE,
    SUBSCRIPTION,
    SUBSCRIPTION_BUTTON_LABEL,
} from '../../../const/donate-page/donate-page';

enum DonateTab {
    oneTime,
    subscription,
}

enum Currency {
    UAH = 'UAH',
    USD = 'USD',
    EUR = 'EUR',
}

export const DonateSection = () => {
    const [activeTab, setActiveTab] = useState<DonateTab>(DonateTab.oneTime);
    const [donationAmount, setDonationAmount] = useState<number>(0);
    const [currency, setCurrency] = useState<Currency>(Currency.UAH);

    const setDonateTabClass = (donateTabType: DonateTab): string => {
        return activeTab === donateTabType ? 'donateTab active' : 'donateTab';
    };

    const handleDonateAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let inputValue = e.target.value;

        if (inputValue.includes('-') || inputValue.includes('+')) {
            inputValue = inputValue.replace(/-/g, '');
            inputValue = inputValue.replace(/\+/g, '');
        }
        setDonationAmount(isNaN(Number(inputValue)) ? 0 : Number(inputValue));
    };

    const handleQuickAmountChange = (amount: number) => {
        setDonationAmount((donationAmount as number) + amount);
    };

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCurrency(e.target.value as Currency);
    };

    return (
        <div className="donateSection">
            <div className="donateTabsContainer">
                <button
                    className={setDonateTabClass(DonateTab.oneTime)}
                    onClick={() => setActiveTab(DonateTab.oneTime)}
                >
                    {ONE_TIME_DONATE}
                </button>
                <button
                    className={setDonateTabClass(DonateTab.subscription)}
                    onClick={() => setActiveTab(DonateTab.subscription)}
                >
                    {SUBSCRIPTION}
                </button>
            </div>
            <div className="donateAmountSection">
                <input
                    className="donateAmountInput"
                    value={donationAmount || ''}
                    onChange={handleDonateAmountChange}
                    placeholder="0"
                />
                <div className="currencySelector">
                    <select value={currency} onChange={handleCurrencyChange}>
                        <option value={Currency.UAH}>{Currency[Currency.UAH]}</option>
                        <option value={Currency.USD}>{Currency[Currency.USD]}</option>
                        <option value={Currency.EUR}>{Currency[Currency.EUR]}</option>
                    </select>
                    <span className="arrowIcon">▼</span>
                    <span className="currencyText">{currency}</span>
                </div>
            </div>
            <div className="fastDonateOptionsSection">
                <button className="donateFastOptionButton" onClick={() => handleQuickAmountChange(10)}>
                    <span className="donateFastValueText">+10 </span>
                    {currency}
                </button>
                <button className="donateFastOptionButton" onClick={() => handleQuickAmountChange(50)}>
                    <span className="donateFastValueText">+50 </span>
                    {currency}
                </button>
                <button className="donateFastOptionButton" onClick={() => handleQuickAmountChange(100)}>
                    <span className="donateFastValueText">+100 </span>
                    {currency}
                </button>
            </div>
            <button className="donateButton">
                {activeTab === DonateTab.oneTime ? ONE_TIME_DONATE_BUTTON_LABEL : SUBSCRIPTION_BUTTON_LABEL}
            </button>
        </div>
    );
};
