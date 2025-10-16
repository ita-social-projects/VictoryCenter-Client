import { useCallback, useEffect, useState } from 'react';
import { useAdminClient } from '../../../../../hooks/admin/use-admin-client/useAdminClient';
import { SupportOptionsApi } from '../../../../../services/api/admin/donate/support-options/support-options-api';
import { SupportOptionsType } from '../../../../../types/admin/donate';
import { DONATE_TEXT } from '../../../../../const/admin/donate';
import { CategoryBar } from '../../../../../components/admin/category-bar/CategoryBar';
import { GenericDetails } from '../generic-details/GenericDetails';
import { SupportOptionsForm } from '../support-options/support-options-form/SupportOptionsForm';
import {
    Currencies,
    useBankDetails,
    mapCurrencyToBankCurrency,
} from '../bank-details-currencies/currencies-manager/CurrenciesManager';
import './DonatePageContent.scss';

export const DonatePageContent = () => {
    const client = useAdminClient();
    const currencyCategories = Object.values(Currencies);
    const [selectedCategory, setSelectedCategory] = useState<Currencies>(Currencies.UAH);
    const { items, config, setItems, isLoading } = useBankDetails(selectedCategory);
    const [supportOptions, setSupportOptions] = useState<SupportOptionsType[]>([]);
    const [isSupportOptionsLoading, setIsSupportOptionsLoading] = useState(false);

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

    const handleCategorySelect = useCallback((currency: Currencies) => {
        setSelectedCategory(currency);
    }, []);

    // Support Options handlers
    const handleCreateSupportOption = useCallback(
        async (name: string, value: string) => {
            const bankCurrency = mapCurrencyToBankCurrency(selectedCategory);
            setIsSupportOptionsLoading(true);
            try {
                const newOption = await SupportOptionsApi.create(client, { name, value, currency: bankCurrency });
                setSupportOptions((prev) => [...prev, newOption]);
            } finally {
                setIsSupportOptionsLoading(false);
            }
        },
        [client, selectedCategory],
    );

    const handleUpdateSupportOption = useCallback(
        async (id: number, name: string, value: string) => {
            setIsSupportOptionsLoading(true);
            try {
                const updatedOption = await SupportOptionsApi.update(client, id, { name, value });
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
            } finally {
                setIsSupportOptionsLoading(false);
            }
        },
        [client],
    );

    // Bank Details handlers
    const handleCreateBankDetails = useCallback(
        async (data: any) => {
            if (!config) return;
            try {
                const newItem = await config.create(client, data);
                setItems((prev: any) => [...prev, newItem]);
            } catch (error) {
                throw error;
            }
        },
        [client, config, setItems],
    );

    const handleUpdateBankDetails = useCallback(
        async (id: number, data: any) => {
            if (!config) return;
            try {
                const updatedItem = await config.update(client, id, data);
                setItems((prev: any) => prev.map((item: any) => (item.id === id ? updatedItem : item)));
            } catch (error) {
                throw error;
            }
        },
        [client, config, setItems],
    );

    const handleDeleteBankDetails = useCallback(
        async (id: number) => {
            if (!config) return;
            try {
                await config.delete(client, id);
                setItems((prev: any) => prev.filter((item: any) => item.id !== id));
            } catch (error) {
                throw error;
            }
        },
        [client, config, setItems],
    );

    const updateItemsWithCorrespondentBanks = useCallback((prevItems: any, formStateId: number, newBanks: any) => {
        const itemExists = prevItems.some((i: any) => i.id === formStateId);
        if (itemExists) {
            return prevItems.map((i: any) => (i.id === formStateId ? { ...i, correspondentBanks: newBanks } : i));
        }
        return [...prevItems, { id: formStateId, correspondentBanks: newBanks }];
    }, []);

    const handleCorrespondentBanksChange = useCallback(
        (formStateId: number) => (newBanks: any) => {
            setItems((prevItems: any) => updateItemsWithCorrespondentBanks(prevItems, formStateId, newBanks));
        },
        [setItems, updateItemsWithCorrespondentBanks],
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
                createEmptyItem={(data: any) => ({ id: Date.now(), ...data })}
                isChildForm={true}
                onChangeItems={handleCorrespondentBanksChange(formState.id)}
            />
        ),
        [selectedCategory, items, config, handleCorrespondentBanksChange],
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
                            addNewText={DONATE_TEXT.BANK_DETAILS.ADD_FIRST}
                            createEmptyItem={config.createEmptyItem}
                            onSubmit={handleCreateBankDetails}
                            onUpdate={handleUpdateBankDetails}
                            onDelete={handleDeleteBankDetails}
                        >
                            {config.withCorrespondentBanks ? renderCorrespondentBanks : () => null}
                        </GenericDetails>
                    )}
                </div>

                <div className="donate-page-item">
                    <SupportOptionsForm
                        key={selectedCategory}
                        supportOptions={supportOptions}
                        isLoading={isSupportOptionsLoading}
                        onCreateOption={handleCreateSupportOption}
                        onUpdateOption={handleUpdateSupportOption}
                        onDeleteOption={handleDeleteSupportOption}
                    />
                </div>
            </div>
        </div>
    );
};
