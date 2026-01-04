import { useEffect, useState } from 'react';
import './RightSection.scss';
import { AbroadPaymentDetails } from './abroad-payment-details/AbroadPaymentDetails';
import { AlternativeSupportWays } from './alternative-support-ways/AlternativeSupportWays';
import { Tabs } from '@/components/common/tabs/Tabs';
import { UkrainePaymentDetails } from './ukraine-payment-details/UkrainePaymentDetails';
import { Currency, DonatePageData } from '@/types/public/donate-page';
import { useTranslation } from 'react-i18next';
import { currencyToString } from '@/utils/functions/mappers/public/donate/donate';
import { useLocale } from '@/hooks/common/use-locale/useLocale';

interface RightSectionProps {
    donateData: DonatePageData | null;
    error?: string | null;
}

export const RightSection = ({ donateData, error }: RightSectionProps) => {
    const { t } = useTranslation('donatePage');
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
    const [isManualChange, setIsManualChange] = useState(false);
    const { currentLanguage, isEn, isUk } = useLocale();

    useEffect(() => {
        if (isManualChange) return;
        if (isEn) {
            if (availableCurrencies.includes(Currency.USD)) {
                setActiveTab(Currency.USD);
            }
        } else if (isUk) {
            if (availableCurrencies.includes(Currency.UAH)) {
                setActiveTab(Currency.UAH);
            }
        }
    }, [currentLanguage, availableCurrencies, isManualChange, isEn, isUk]);

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
                {t('LOADING_ERROR_MESSAGE')}
            </div>
        );
    }

    if (availableCurrencies.length === 0) {
        return null;
    }

    const tabs = availableCurrencies.map((currency) => {
        const key = currencyToString(currency);
        return {
            id: currency,
            label: t(`CURRENCY_TABS.${key}`),
        };
    });

    return (
        <div className="rightSection">
            <div className="locationToggleContainer">
                <div className="switch">
                    <Tabs
                        activeTab={activeTab}
                        setActiveTab={(tab) => {
                            setIsManualChange(true);
                            setActiveTab(tab);
                        }}
                        tabs={tabs}
                    />
                </div>
            </div>
            <div className="donatePaymentDetails">
                {paymentDetails()}
                <AlternativeSupportWays supportOptions={donateData?.supportOptions || []} currentCurrency={activeTab} />
            </div>
        </div>
    );
};
