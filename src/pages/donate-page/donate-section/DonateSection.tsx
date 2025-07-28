import './DonateSection.scss';
import React, { useState } from 'react';
import { DONATE_SECTION } from '../../../const/donate-page/donate-page';
import { getEnvVariable } from '../../../utils/functions/getEnvVariable';
import { DonateTab } from '../../../types/public/donate-page/DonateTab';
import { Currency } from '../../../types/public/donate-page/Currency';
import { PaymentSystem } from '../../../types/public/donate-page/PaymentStatus';

export const DonateSection = () => {
    const [activeTab, setActiveTab] = useState<DonateTab>(DonateTab.oneTime);
    const [donationAmount, setDonationAmount] = useState<number>(0);
    const [currency, setCurrency] = useState<Currency>(Currency.UAH);

    const setDonateTabClass = (donateTabType: DonateTab): string => {
        return activeTab === donateTabType ? 'donateTab active' : 'donateTab';
    };

    const handleDonateAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let inputValue = e.target.value;

        inputValue = inputValue.replace(/[^0-9]/g, '');
        inputValue = inputValue.replace(/[-+]/g, '');

        setDonationAmount(isNaN(Number(inputValue)) ? 0 : Number(inputValue));
    };

    const handleQuickAmountChange = (amount: number) => {
        setDonationAmount((donationAmount as number) + amount);
    };

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCurrency(e.target.value as Currency);
    };

    const handleSubmit: React.FormEventHandler<HTMLFormElement> | undefined = (e) => {
        e.preventDefault();

        if (donationAmount <= 0 || !Number.isInteger(donationAmount)) {
            return;
        }

        const form = e.currentTarget;

        setTimeout(() => {
            form.submit();
        }, 0);
    };

    return (
        <form
            className="donateSection"
            action={`${getEnvVariable('REACT_APP_BACKEND_URL')}/payments/donate`}
            method="post"
            onSubmit={handleSubmit}
            data-testid="donate-section-form"
        >
            <input
                type="hidden"
                name="isSubscription"
                value={(activeTab === DonateTab.subscription).toString()}
            ></input>
            <input type="hidden" name="paymentSystem" value={PaymentSystem.WayForPay}></input>
            <div className="donateTabsContainer">
                <button
                    className={setDonateTabClass(DonateTab.oneTime)}
                    type="button"
                    onClick={() => setActiveTab(DonateTab.oneTime)}
                >
                    {DONATE_SECTION.ONE_TIME_DONATE}
                </button>
                <div className="tooltip-container top">
                    <button
                        className={setDonateTabClass(DonateTab.subscription)}
                        type="button"
                        onClick={() => setActiveTab(DonateTab.subscription)}
                        disabled
                    >
                        {DONATE_SECTION.SUBSCRIPTION}
                    </button>
                    <span className="tooltip-text">
                        <div className="text-center">
                            <p className="font-semibold">Subscription is not yet available.</p>
                            <p>Please check back later!</p>
                        </div>
                    </span>
                </div>
            </div>
            <div className="donateAmountSection">
                <input
                    name="amount"
                    className="donateAmountInput"
                    value={donationAmount || '0'}
                    onChange={handleDonateAmountChange}
                    placeholder="0"
                />
                <div className="currencySelector">
                    <select name="currency" value={currency} onChange={handleCurrencyChange}>
                        <option value={Currency.UAH}>{Currency[Currency.UAH]}</option>
                        <option value={Currency.USD}>{Currency[Currency.USD]}</option>
                        <option value={Currency.EUR}>{Currency[Currency.EUR]}</option>
                    </select>
                    <span className="arrowIcon">▼</span>
                    <span className="currencyText">{currency}</span>
                </div>
            </div>
            <div className="fastDonateOptionsSection">
                <button className="donateFastOptionButton" onClick={() => handleQuickAmountChange(10)} type="button">
                    <span className="donateFastValueText">+10 </span>
                    {currency}
                </button>
                <button className="donateFastOptionButton" onClick={() => handleQuickAmountChange(50)} type="button">
                    <span className="donateFastValueText">+50 </span>
                    {currency}
                </button>
                <button className="donateFastOptionButton" onClick={() => handleQuickAmountChange(100)} type="button">
                    <span className="donateFastValueText">+100 </span>
                    {currency}
                </button>
            </div>
            <button className="donateButton" type="submit">
                {activeTab === DonateTab.oneTime
                    ? DONATE_SECTION.ONE_TIME_DONATE_BUTTON_LABEL
                    : DONATE_SECTION.SUBSCRIPTION_BUTTON_LABEL}
            </button>
        </form>
    );
};
