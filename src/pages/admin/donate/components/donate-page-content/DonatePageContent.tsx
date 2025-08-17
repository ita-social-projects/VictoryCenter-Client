import { useCallback, useEffect, useState } from 'react';
import { CategoryBar } from '../../../../../components/admin/category-bar/CategoryBar';
import { BankDetailsType, CurrencyCategory, SupportOptionsType } from '../../../../../types/admin/donate';
import './DonatePageContent.scss';
import { BankDetails } from '../bank-details/BankDetails';
import { SupportOptions } from '../support-options/SupportOptions';

export const DonatePageContent = () => {
    const [categories, setCategories] = useState<CurrencyCategory[]>([]);
    const [bankDetails, setBankDetails] = useState<BankDetailsType[]>([]);
    const [supportOptions, setSupportOptions] = useState<SupportOptionsType[]>([]);

    let isLoading = false;

    const fetchCategories = useCallback(() => {
        const currencies: CurrencyCategory[] = [
            { id: 1, name: 'UAH' },
            { id: 2, name: 'USD' },
            { id: 3, name: 'EUR' },
        ];
        setCategories(currencies);
    }, []);

    const fetchBankDetails = useCallback(() => {
        const bankDetails: BankDetailsType[] = [
            // { id: 1, name: 'Одержувач', value: 'ГО "ЦЕНТР ПЕРЕМОГИ"' },
            // { id: 2, name: 'ЄДРПОУ', value: '45262516' },
        ];
        setBankDetails(bankDetails);
    }, []);

    const fetchSupportOptions = useCallback(() => {
        const supportOptions: SupportOptionsType[] = [
            { id: 1, name: 'Pay Pal', value: 'victorycenterua@gmail.com' },
            { id: 2, name: 'Monobank баночка', value: 'monobank.ua' },
        ];
        setSupportOptions(supportOptions);
    }, []);

    const renderBankDetails = useCallback(
        (bankDetails: BankDetailsType) => <div></div>,
        [],
        // (program: Program) => (
        //     <ProgramListItem
        //         key={program.id}
        //         program={program}
        //         handleOnEditProgram={handleEditProgramModelOpen}
        //         handleOnDeleteProgram={handleDeleteProgramModalOpen}
        //     />
        // ),
        // [handleEditProgramModelOpen, handleDeleteProgramModalOpen],
    );

    const renderSupportOptions = useCallback((supportOptions: SupportOptionsType) => <div></div>, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        fetchBankDetails();
    }, [fetchBankDetails]);

    const [selectedCategory, setSelectedCategory] = useState<CurrencyCategory | null>(null);
    const handleCategorySelect = useCallback((category: CurrencyCategory) => {
        setSelectedCategory(category);
    }, []);
    return (
        <div className="donate-page-wrapper">
            <CategoryBar<CurrencyCategory>
                categories={categories}
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
                getCategoryDisplayName={(category) => category.name}
                getCategoryKey={(category) => category.id}
                displayContextMenuButton={true}
            />
            <div className="donate-page-credits-container">
                <BankDetails items={bankDetails} renderItem={renderBankDetails} isLoading={isLoading} />
                <SupportOptions items={supportOptions} renderItem={renderSupportOptions} isLoading={isLoading} />
            </div>
        </div>
    );
};
