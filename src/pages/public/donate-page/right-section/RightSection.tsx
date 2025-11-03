import { useState } from 'react';
import './RightSection.scss';
import { LinearProgress } from '@mui/material';

import { AbroadPaymentDetails } from './abroad-payment-details/AbroadPaymentDetails';
import { AlternativeSupportWays } from './alternative-support-ways/AlternativeSupportWays';
import { Tabs } from '../../../../components/common/tabs/Tabs';
import { UkrainePaymentDetails } from './ukraine-payment-details/UkrainePaymentDetails';
import { Currency, DonatePageData, BankCurrency } from '../../../../types/public/donate-page';
import { CURRENCY_TABS } from '../../../../const/public/donate-page';
import { donatePageDataFetch } from '../../../../services/api/public/donate/donate-api';
import { useDataFetch } from '../../../../hooks/common/use-data-fetch/useDataFetch';

export const RightSection = () => {
    const [activeTab, setActiveTab] = useState<Currency>(Currency.UAH);

    const {
        data: donateData,
        isLoading,
        error,
    } = useDataFetch<DonatePageData | null>({
        initialData: null,
        fetchHandler: donatePageDataFetch,
        autoFetchDependencies: [],
    });

    const paymentDetails = () => {
        if (!donateData) return null;

        switch (activeTab) {
            case Currency.UAH:
                return <UkrainePaymentDetails bankDetails={donateData.uahBankDetails} />;
            case Currency.USD:
                return (
                    <AbroadPaymentDetails
                        currency={activeTab}
                        foreignBankDetails={donateData.foreignBankDetails.filter(
                            (b) => b.currency === BankCurrency.Usd,
                        )}
                    />
                );
            case Currency.EUR:
                return (
                    <AbroadPaymentDetails
                        currency={activeTab}
                        foreignBankDetails={donateData.foreignBankDetails.filter(
                            (b) => b.currency === BankCurrency.Eur,
                        )}
                    />
                );
        }
    };

    if (isLoading) {
        return (
            <div className="donate-loader">
                <LinearProgress />
            </div>
        );
    }

    if (error) {
        return (
            <div className="donate-error-message" role="alert">
                Не вдалося завантажити реквізити
            </div>
        );
    }

    return (
        <div className="rightSection">
            <div className="locationToggleContainer">
                <div className="switch">
                    <Tabs
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        tabs={[
                            { id: Currency.UAH, label: CURRENCY_TABS.UAH },
                            { id: Currency.USD, label: CURRENCY_TABS.USD },
                            { id: Currency.EUR, label: CURRENCY_TABS.EUR },
                        ]}
                    />
                </div>
            </div>
            <div className="donatePaymentDetails">
                {paymentDetails()}
                <AlternativeSupportWays supportOptions={donateData?.supportOptions || []} />
            </div>
        </div>
    );
};
