import { useCallback, useEffect, useState } from 'react';
import { useAdminClient } from '../../../../../hooks/admin/use-admin-client/useAdminClient';
import { SupportOptionsApi } from '../../../../../services/api/admin/donate/support-options/support-options-api';
import { CorrespondentBankDetailsApi } from '../../../../../services/api/admin/donate/correspondent-banks/correspondent-banks-api';
import {
    ForeignBankDetailsDto,
    SupportOptionsDto,
    UahBankDetailsDto,
    CreateCorrespondentBankDetails,
    UpdateCorrespondentBankDetails,
} from '../../../../../types/admin/donate';
import { DONATE_TEXT } from '../../../../../const/admin/donate';
import { CategoryBar } from '../../../../../components/admin/category-bar/CategoryBar';
import { GenericDetails } from '../generic-details/GenericDetails';
import { SupportOptionsForm } from '../support-options/support-options-form/SupportOptionsForm';
import {
    Currencies,
    useBankDetails,
    mapCurrencyToBankCurrency,
} from '../bank-details-currencies/currencies-manager/CurrenciesManager';
import { useToast } from '../../../../../contexts/admin/toast-context-provider/ToastContextProvider';
import { ToastType } from '../../../../../types/admin/toast';
import { ToastContainer } from '../../../../../components/admin/toast/toast-container/ToastContainer';
import './DonatePageContent.scss';

export const DonatePageContent = () => {
    const { addToast } = useToast();
    const client = useAdminClient();
    const currencyCategories = Object.values(Currencies);
    const [selectedCategory, setSelectedCategory] = useState<Currencies>(Currencies.UAH);
    const { items, config, setItems, isLoading } = useBankDetails(selectedCategory);
    const [supportOptions, setSupportOptions] = useState<SupportOptionsDto[]>([]);
    const [isSupportOptionsLoading, setIsSupportOptionsLoading] = useState(false);

    const [isCorrespondentBankFormVisible, setIsCorrespondentBankFormVisible] = useState(false);
    useEffect(() => {
        let isAlive = true;
        const bankCurrency = mapCurrencyToBankCurrency(selectedCategory);

        setIsSupportOptionsLoading(true);
        SupportOptionsApi.getAll(client, bankCurrency)
            .then((data) => {
                if (isAlive) {
                    setSupportOptions(data);
                }
            })
            .catch(() => {
                if (isAlive) {
                    setSupportOptions([]);
                }
            })
            .finally(() => {
                if (isAlive) {
                    setIsSupportOptionsLoading(false);
                }
            });

        return () => {
            isAlive = false;
        };
    }, [client, selectedCategory]);

    const handleCategorySelect = useCallback(
        (currency: Currencies) => {
            if (currency === selectedCategory) {
                return;
            }

            setSupportOptions([]);
            setIsSupportOptionsLoading(true);
            setSelectedCategory(currency);
        },
        [selectedCategory],
    );

    // Support Options handlers
    const handleCreateSupportOption = useCallback(
        async (name: string, value: string) => {
            const bankCurrency = mapCurrencyToBankCurrency(selectedCategory);
            setIsSupportOptionsLoading(true);
            try {
                const newOption = await SupportOptionsApi.create(client, { name, value, currency: bankCurrency });
                setSupportOptions((prev) => [...prev, newOption]);

                addToast(DONATE_TEXT.MESSAGE.SUPPORT_OPTIONS.PUBLISHED, ToastType.Info);
            } finally {
                setIsSupportOptionsLoading(false);
            }
        },
        [client, selectedCategory, addToast],
    );

    const handleUpdateSupportOption = useCallback(
        async (id: number, name: string, value: string) => {
            setIsSupportOptionsLoading(true);
            try {
                const updatedOption = await SupportOptionsApi.update(client, id, {
                    name,
                    value,
                });
                setSupportOptions((prev) => prev.map((option) => (option.id === id ? updatedOption : option)));
            } finally {
                setIsSupportOptionsLoading(false);
            }
        },
        [client],
    );

    const handleDeleteSupportOption = useCallback(
        async (id: number) => {
            setIsSupportOptionsLoading(true);
            try {
                await SupportOptionsApi.delete(client, id);
                setSupportOptions((prev) => prev.filter((option) => option.id !== id));
                addToast(DONATE_TEXT.MESSAGE.SUPPORT_OPTIONS.DELETED, ToastType.Info);
            } finally {
                setIsSupportOptionsLoading(false);
            }
        },
        [client, addToast],
    );

    // Bank Details handlers
    const handleCreateBankDetails = useCallback(
        async (data: UahBankDetailsDto | ForeignBankDetailsDto) => {
            if (!config) return;
            try {
                // Remove fields that shouldn't be sent to API (id, currency, correspondentBanks)
                const { id, currency, correspondentBanks, ...cleanData } = data as ForeignBankDetailsDto;
                const newItem = await config.create(client, cleanData);

                setItems((prev: (UahBankDetailsDto | ForeignBankDetailsDto)[]) => [...prev, newItem]);
            } catch (error) {
                throw error;
            }
        },
        [client, config, setItems],
    );

    const handleUpdateBankDetails = useCallback(
        async (id: number, data: UahBankDetailsDto | ForeignBankDetailsDto) => {
            if (!config) return;
            try {
                // Remove fields that shouldn't be sent to API (id, currency, correspondentBanks)
                const { id: _id, currency, correspondentBanks, ...cleanData } = data as ForeignBankDetailsDto;
                const updatedItem = await config.update(client, id, cleanData);

                setItems((prev: (UahBankDetailsDto | ForeignBankDetailsDto)[]) =>
                    prev.map((item) => {
                        if (item.id === id) {
                            return {
                                ...updatedItem,
                                correspondentBanks: 'correspondentBanks' in item ? item.correspondentBanks : [],
                            };
                        }
                        return item;
                    }),
                );
                addToast(DONATE_TEXT.MESSAGE.CHANGES_SAVED, ToastType.Info);
            } catch (error) {
                throw error;
            }
        },
        [client, config, setItems, addToast],
    );

    const handleDeleteBankDetails = useCallback(
        async (id: number) => {
            if (!config) return;
            try {
                await config.delete(client, id);
                setItems((prev: any) => prev.filter((item: any) => item.id !== id));
                addToast(DONATE_TEXT.MESSAGE.BANK_DETAILS.DELETE, ToastType.Info);
            } catch (error) {
                throw error;
            }
        },
        [client, config, setItems, addToast],
    );

    // Correspondent Bank Details handlers
    const handleCreateCorrespondentBank = useCallback(
        async (foreignBankId: number, data: CreateCorrespondentBankDetails) => {
            try {
                const newBank = await CorrespondentBankDetailsApi.create(client, data);
                setItems((prev: any) =>
                    prev.map((item: any) =>
                        item.id === foreignBankId
                            ? { ...item, correspondentBanks: [...(item.correspondentBanks || []), newBank] }
                            : item,
                    ),
                );
            } catch (error) {
                throw error;
            }
        },
        [client, setItems],
    );

    const handleUpdateCorrespondentBank = useCallback(
        async (foreignBankId: number, id: number, data: UpdateCorrespondentBankDetails) => {
            try {
                const updatedBank = await CorrespondentBankDetailsApi.update(client, id, data);
                setItems((prev: any) =>
                    prev.map((item: any) =>
                        item.id === foreignBankId
                            ? {
                                  ...item,
                                  correspondentBanks: item.correspondentBanks.map((cb: any) =>
                                      cb.id === id ? updatedBank : cb,
                                  ),
                              }
                            : item,
                    ),
                );
            } catch (error) {
                throw error;
            }
        },
        [client, setItems],
    );

    const handleDeleteCorrespondentBank = useCallback(
        async (foreignBankId: number, id: number) => {
            try {
                await CorrespondentBankDetailsApi.delete(client, id);
                setItems((prev: any) =>
                    prev.map((item: any) =>
                        item.id === foreignBankId
                            ? {
                                  ...item,
                                  correspondentBanks: item.correspondentBanks.filter((cb: any) => cb.id !== id),
                              }
                            : item,
                    ),
                );

                addToast(DONATE_TEXT.MESSAGE.CORRESPONDENT_BANKS.DELETED, ToastType.Info);
            } catch (error) {
                throw error;
            }
        },
        [client, setItems, addToast],
    );

    const renderCorrespondentBanks = useCallback(
        ({ formState, isItemsExpanded }: any) => (
            <GenericDetails
                key={`corr-${selectedCategory}-${formState.id}`}
                title={DONATE_TEXT.CORRESPONDENT_BANKS.TITLE}
                items={items.find((i) => i.id === formState.id)?.correspondentBanks ?? []}
                isLoading={false}
                FormComponent={config?.correspondentForm!}
                initialIsItemsExpanded={isItemsExpanded}
                primaryAddButton={true}
                addNewText={DONATE_TEXT.CORRESPONDENT_BANKS.ADD_NEW}
                isChildForm={true}
                onSubmit={(data) => handleCreateCorrespondentBank(formState.id, data)}
                onUpdate={(id, data) => handleUpdateCorrespondentBank(formState.id, id, data)}
                onDelete={(id) => handleDeleteCorrespondentBank(formState.id, id)}
                onAddFormVisibilityChange={setIsCorrespondentBankFormVisible}
            />
        ),
        [
            selectedCategory,
            items,
            config,
            handleCreateCorrespondentBank,
            handleUpdateCorrespondentBank,
            handleDeleteCorrespondentBank,
        ],
    );

    return (
        <div className="donate-page-wrapper">
            <CategoryBar<Currencies>
                categories={currencyCategories}
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
                getCategoryDisplayName={(currency) => currency}
                getCategoryKey={(currency) => currency}
                displayContextMenuButton={true}
            />
            <div className="donate-page-container">
                <div className="donate-page-item">
                    {config && (
                        <GenericDetails
                            key={`bank-details-${selectedCategory}`}
                            items={items}
                            isLoading={isLoading}
                            FormComponent={config.form}
                            notFoundText={DONATE_TEXT.BANK_DETAILS.NOT_FOUND}
                            addNewText={DONATE_TEXT.BANK_DETAILS.ADD_NEW}
                            onSubmit={handleCreateBankDetails}
                            onUpdate={handleUpdateBankDetails}
                            onDelete={handleDeleteBankDetails}
                            isParentAddFormVisible={isCorrespondentBankFormVisible}
                        >
                            {config.withCorrespondentBanks ? renderCorrespondentBanks : () => null}
                        </GenericDetails>
                    )}
                </div>

                <div className="donate-page-item">
                    <SupportOptionsForm
                        supportOptions={supportOptions}
                        isLoading={isSupportOptionsLoading}
                        onCreateOption={handleCreateSupportOption}
                        onUpdateOption={handleUpdateSupportOption}
                        onDeleteOption={handleDeleteSupportOption}
                    />
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};
