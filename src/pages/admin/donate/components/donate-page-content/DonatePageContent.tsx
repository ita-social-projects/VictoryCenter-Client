import { useCallback, useState } from 'react';
import { CategoryBar } from '../../../../../components/admin/category-bar/CategoryBar';
import { SupportOptionsType } from '../../../../../types/admin/donate';
import './DonatePageContent.scss';
import { GenericDetails } from '../generic-details/GenericDetails';
import { Currencies, useBankDetails } from '../bank-details-currencies/currencies-manager/CurrenciesManager';
import { SupportOptionsForm } from '../support-options/support-options-form/SupportOptionsForm';
import { DONATE_TEXT } from '../../../../../const/admin/donate';

export const DonatePageContent = () => {
    const currencyCategories = Object.values(Currencies);
    const [selectedCategory, setSelectedCategory] = useState<Currencies>(Currencies.UAH);
    const { items, config, setItems, isLoading } = useBankDetails(selectedCategory);

    const [supportOptionsByCurrency, setSupportOptionsByCurrency] = useState<Record<Currencies, SupportOptionsType[]>>({
        [Currencies.UAH]: [],
        [Currencies.USD]: [],
        [Currencies.EUR]: [],
    });
    const supportOptions = supportOptionsByCurrency[selectedCategory] ?? [];

    const updateSupportOptions = (newOptions: SupportOptionsType[]) => {
        setSupportOptionsByCurrency((prev) => ({
            ...prev,
            [selectedCategory]: newOptions,
        }));
    };

    const handleCategorySelect = useCallback((currency: Currencies) => {
        setSelectedCategory(currency);
    }, []);

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
                            items={items}
                            isLoading={isLoading}
                            FormComponent={config.form}
                            notFoundText={DONATE_TEXT.BANK_DETAILS.NOT_FOUND}
                            addNewText={DONATE_TEXT.BANK_DETAILS.ADD_FIRST}
                            createEmptyItem={config.createEmptyItem}
                            onChangeItems={setItems}
                        >
                            {config.withCorrespondentBanks
                                ? ({ formState, isItemsExpanded }) => (
                                      <GenericDetails
                                          title={DONATE_TEXT.CORRESPONDENT_BANKS.TITLE}
                                          items={formState.correspondentBanks ?? []}
                                          isLoading={false}
                                          FormComponent={config.correspondentForm!}
                                          initialIsItemsExpanded={isItemsExpanded}
                                          primaryAddButton={true}
                                          addNewText={DONATE_TEXT.CORRESPONDENT_BANKS.ADD_NEW}
                                          createEmptyItem={(data) => ({ id: Date.now(), ...data })}
                                          isChildForm={true}
                                      />
                                  )
                                : () => null}
                        </GenericDetails>
                    )}
                </div>

                <div className="donate-page-item">
                    <SupportOptionsForm initialData={supportOptions} onChangeItems={updateSupportOptions} />
                </div>
            </div>
        </div>
    );
};
