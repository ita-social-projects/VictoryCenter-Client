import { API_ROUTES } from '../../../../const/common/api-routes/main-api';
import {
    PublishedUahBankDetailsDto,
    PublishedForeignBankDetailsDto,
    PublishedSupportOptionsDto,
    Currency,
    DonatePageData,
} from '../../../../types/public/donate-page';
import { axiosInstance } from '../../axios';

export const donatePageDataFetch = async (): Promise<DonatePageData> => {
    const [
        uahBankDetailsResponse,
        usdForeignResponse,
        eurForeignResponse,
        uahSupportResponse,
        usdSupportResponse,
        eurSupportResponse,
    ] = await Promise.all([
        axiosInstance.get<PublishedUahBankDetailsDto[]>(API_ROUTES.DONATE.PUBLIC.UAH_BANK_DETAILS),

        axiosInstance.get<PublishedForeignBankDetailsDto[]>(API_ROUTES.DONATE.PUBLIC.FOREIGN_BANK_DETAILS, {
            params: { currency: Currency.USD },
        }),

        axiosInstance.get<PublishedForeignBankDetailsDto[]>(API_ROUTES.DONATE.PUBLIC.FOREIGN_BANK_DETAILS, {
            params: { currency: Currency.EUR },
        }),

        axiosInstance.get<PublishedSupportOptionsDto[]>(API_ROUTES.DONATE.PUBLIC.SUPPORT_OPTIONS, {
            params: { currency: Currency.UAH },
        }),

        axiosInstance.get<PublishedSupportOptionsDto[]>(API_ROUTES.DONATE.PUBLIC.SUPPORT_OPTIONS, {
            params: { currency: Currency.USD },
        }),

        axiosInstance.get<PublishedSupportOptionsDto[]>(API_ROUTES.DONATE.PUBLIC.SUPPORT_OPTIONS, {
            params: { currency: Currency.EUR },
        }),
    ]);

    return {
        uahBankDetails: uahBankDetailsResponse.data,
        foreignBankDetails: [...usdForeignResponse.data, ...eurForeignResponse.data],
        supportOptions: [...uahSupportResponse.data, ...usdSupportResponse.data, ...eurSupportResponse.data],
    };
};
