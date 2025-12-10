import { useCallback, useEffect, useState } from 'react';
import { useAdminClient } from '../../../../../hooks/admin/use-admin-client/useAdminClient';
import { SupportOptionsApi } from '../../../../../services/api/admin/donate/support-options/support-options-api';
import { CorrespondentBankDetailsApi } from '../../../../../services/api/admin/donate/correspondent-banks/correspondent-banks-api';
import {
    ForeignBankDetailsDto,
    SupportOptionsDto,
    UahBankDetailsDto,
    CreateUahBankDetails,
    UpdateUahBankDetails,
    CreateForeignBankDetails,
    UpdateForeignBankDetails,
    CreateSupportOptionsDto,
    UpdateSupportOptionsDto,
    CorrespondentBankDetailsDto,
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
import {
    mapToCreateUahBankDetails,
    mapToUpdateUahBankDetails,
    mapToCreateForeignBankDetails,
    mapToUpdateForeignBankDetails,
    mapToCreateCorrespondentBankDetails,
    mapToUpdateCorrespondentBankDetails,
} from '../../../../../utils/functions/mappers/admin/donate-mappers';
import './DonatePageContent.scss';

export const DonatePageContent = () => {
    const { addToast } = useToast();
    const client = useAdminClient();
    const currencyCategories = Object.values(Currencies);
    const [selectedCategory, setSelectedCategory] = useState<Currencies>(Currencies.UAH);
    const { items, config, setItems, isLoading } = useBankDetails(selectedCategory);
    const [supportOptions, setSupportOptions] = useState<SupportOptionsDto[]>([]);
    const [isSupportOptionsLoading, setIsSupportOptionsLoading] = useState(false);
    const [isChildEditing, setIsChildEditing] = useState(false);

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
                const createData: CreateSupportOptionsDto = { name, value, currency: bankCurrency };
                const newOption = await SupportOptionsApi.create(client, createData);
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
                const updateData: UpdateSupportOptionsDto = { name, value };
                const updatedOption = await SupportOptionsApi.update(client, id, updateData);
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
                const createData: CreateUahBankDetails | CreateForeignBankDetails =
                    'correspondentBanks' in data
                        ? mapToCreateForeignBankDetails(data)
                        : mapToCreateUahBankDetails(data);
                const newItem = await config.create(client, createData);

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
                const updateData: UpdateUahBankDetails | UpdateForeignBankDetails =
                    'correspondentBanks' in data
                        ? mapToUpdateForeignBankDetails(data)
                        : mapToUpdateUahBankDetails(data);
                const updatedItem = await config.update(client, id, updateData);

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
        async (foreignBankId: number, data: CorrespondentBankDetailsDto) => {
            try {
                const createData = mapToCreateCorrespondentBankDetails(data, foreignBankId);
                const newBank = await CorrespondentBankDetailsApi.create(client, createData);
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
        async (foreignBankId: number, id: number, data: CorrespondentBankDetailsDto) => {
            try {
                const updateData = mapToUpdateCorrespondentBankDetails(data);
                const updatedBank = await CorrespondentBankDetailsApi.update(client, id, updateData);
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

    const handleLocalSubmit = useCallback(
        (formState: any, setFormState: any, data: CorrespondentBankDetailsDto) => {
            const updatedBanks = [...(formState.correspondentBanks || []), data];

            setFormState({
                ...formState,
                correspondentBanks: updatedBanks,
            });

            addToast(DONATE_TEXT.MESSAGE.CORRESPONDENT_BANKS.ADD, ToastType.Info);
        },
        [addToast],
    );

    const handleLocalUpdate = useCallback(() => {
        addToast(DONATE_TEXT.MESSAGE.CORRESPONDENT_BANKS.UPDATE, ToastType.Info);
    }, [addToast]);

    const handleLocalDelete = useCallback(
        (formState: any, setFormState: any, index: number): void => {
            const updatedBanks = [...formState.correspondentBanks];
            updatedBanks.splice(index, 1);
            setFormState({ ...formState, correspondentBanks: updatedBanks });
            addToast(DONATE_TEXT.MESSAGE.CORRESPONDENT_BANKS.DELETED, ToastType.Info);
        },
        [addToast],
    );

    const renderCorrespondentBanks = useCallback(
        ({ formState, isItemsExpanded, setFormState }: any) => {
            const isCreating = !formState.id;
            const localBanks = formState.correspondentBanks || [];

            const existingItem = items.find((i) => i.id === formState.id);
            const banksToShow = isCreating
                ? localBanks
                : [...(existingItem?.correspondentBanks ?? [])].sort((a, b) => a.id - b.id);

            return (
                <GenericDetails
                    key={`corr-${selectedCategory}-${formState.id}`}
                    title={DONATE_TEXT.CORRESPONDENT_BANKS.TITLE}
                    items={banksToShow}
                    isLoading={false}
                    FormComponent={config?.correspondentForm!}
                    initialIsItemsExpanded={isItemsExpanded}
                    primaryAddButton={true}
                    addNewText={DONATE_TEXT.CORRESPONDENT_BANKS.ADD_NEW}
                    isChildForm={true}
                    isDisabled={!formState.id}
                    isParentCreating={isCreating}
                    onSubmit={(data) => handleCreateCorrespondentBank(formState.id, data)}
                    onUpdate={(id, data) => handleUpdateCorrespondentBank(formState.id, id, data)}
                    onDelete={(id) => handleDeleteCorrespondentBank(formState.id, id)}
                    onLocalSubmit={(data) => handleLocalSubmit(formState, setFormState, data)}
                    onLocalUpdate={handleLocalUpdate}
                    onLocalDelete={(index) => handleLocalDelete(formState, setFormState, index)}
                    onEditingStateChange={setIsChildEditing}
                    onAddFormVisibilityChange={setIsCorrespondentBankFormVisible}
                />
            );
        },
        [
            selectedCategory,
            items,
            config,
            handleCreateCorrespondentBank,
            handleUpdateCorrespondentBank,
            handleDeleteCorrespondentBank,
            handleLocalSubmit,
            handleLocalUpdate,
            handleLocalDelete,
            setIsChildEditing,
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
                            items={[...items].sort((a, b) => a.id - b.id)}
                            isLoading={isLoading}
                            FormComponent={config.form}
                            notFoundText={DONATE_TEXT.BANK_DETAILS.NOT_FOUND}
                            addNewText={
                                items.length > 0 ? DONATE_TEXT.BANK_DETAILS.ADD_NEW : DONATE_TEXT.BANK_DETAILS.ADD_FIRST
                            }
                            onSubmit={handleCreateBankDetails}
                            onUpdate={handleUpdateBankDetails}
                            onDelete={handleDeleteBankDetails}
                            isAddButtonDisabled={isChildEditing}
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
