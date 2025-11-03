import { API_ROUTES } from '../../../../const/common/api-routes/main-api';
import {
    PublicUahBankDetailsDto,
    PublicForeignBankDetailsDto,
    PublicSupportOptionsDto,
    BankCurrency,
    DonatePageData,
} from '../../../../types/public/donate-page';
import { axiosInstance } from '../../axios';

// TODO:
const TEMP_PUBLIC_ROUTES = {
    BANK_DETAILS_UAH: 'api/public/donate/bank-details-uah', // TODO:
    BANK_DETAILS_FOREIGN: 'api/public/donate/bank-details-foreign', // TODO:
    SUPPORT_OPTIONS: 'api/public/donate/support-options', // TODO:
};

export const donatePageDataFetch = async (): Promise<DonatePageData> => {
    // TODO:
    const [
        uahBankDetailsResponse,
        usdForeignResponse,
        eurForeignResponse,
        uahSupportResponse,
        usdSupportResponse,
        eurSupportResponse,
    ] = await Promise.all([
        axiosInstance.get<PublicUahBankDetailsDto[]>(TEMP_PUBLIC_ROUTES.BANK_DETAILS_UAH),
        axiosInstance.get<PublicForeignBankDetailsDto[]>(TEMP_PUBLIC_ROUTES.BANK_DETAILS_FOREIGN, {
            params: { currency: BankCurrency.Usd },
        }),
        axiosInstance.get<PublicForeignBankDetailsDto[]>(TEMP_PUBLIC_ROUTES.BANK_DETAILS_FOREIGN, {
            params: { currency: BankCurrency.Eur },
        }),
        axiosInstance.get<PublicSupportOptionsDto[]>(TEMP_PUBLIC_ROUTES.SUPPORT_OPTIONS, {
            params: { currency: BankCurrency.Uah },
        }),
        axiosInstance.get<PublicSupportOptionsDto[]>(TEMP_PUBLIC_ROUTES.SUPPORT_OPTIONS, {
            params: { currency: BankCurrency.Usd },
        }),
        axiosInstance.get<PublicSupportOptionsDto[]>(TEMP_PUBLIC_ROUTES.SUPPORT_OPTIONS, {
            params: { currency: BankCurrency.Eur },
        }),
    ]);

    return {
        uahBankDetails: uahBankDetailsResponse.data,
        foreignBankDetails: [...usdForeignResponse.data, ...eurForeignResponse.data],
        supportOptions: [...uahSupportResponse.data, ...usdSupportResponse.data, ...eurSupportResponse.data],
    };
};
