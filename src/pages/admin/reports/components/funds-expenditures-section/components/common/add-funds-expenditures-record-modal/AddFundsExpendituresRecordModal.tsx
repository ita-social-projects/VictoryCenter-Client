import { FocusEvent, useMemo, useRef } from 'react';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import { InputWithCharacterLimit } from '@/components/admin/input-with-character-limit/InputWithCharacterLimit';
import { Select } from '@/components/common/select/Select';
import { FundsExpendituresRecordModal } from '@/pages/admin/reports/components/funds-expenditures-section/components/common/funds-expenditures-record-modal/FundsExpendituresRecordModal';
import {
    FundsExpendituresTransactionType,
    ReportFundsExpendituresCategory,
    ReportFundsExpendituresRecord,
} from '@/types/admin/reports';
import { ReactComponent as InfoIcon } from '@/assets/icons/info.svg';
import { getReportingYearOptions } from '@/utils/functions/get-reporting-year-options/get-reporting-year-options';
import { useFundsExpendituresRecordForm } from '@/hooks/admin/use-funds-expenditures-record-form/useFundsExpendituresRecordForm';
import styles from './AddFundsExpendituresRecordModal.module.scss';

interface AddFundsExpendituresRecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    transactionType: FundsExpendituresTransactionType;
    categories: ReportFundsExpendituresCategory[];
    records: ReportFundsExpendituresRecord[];
    exchangeRate: string | null;
    onSubmit: (data: {
        categoryId: number;
        reportingYear: string;
        amountUah: string;
        amountUsd: string;
        type: FundsExpendituresTransactionType;
    }) => Promise<boolean>;
}

export const AddFundsExpendituresRecordModal = ({
    isOpen,
    onClose,
    transactionType,
    categories,
    records,
    exchangeRate,
    onSubmit,
}: AddFundsExpendituresRecordModalProps) => {
    const yearOptions = useMemo(() => getReportingYearOptions(), []);

    const {
        formState,
        filteredCategories,
        isCategorySelectDisabled,
        isSubmitting,
        isDirty,
        isSubmitDisabled,
        isAddConfirmationOpen,
        usdMismatchMessage,
        handleReportingYearChange,
        handleReportingYearBlur,
        handleCategoryChange,
        handleCategoryBlur,
        handleAmountChange,
        handleAmountBlur,
        handleUsdChange,
        handleOpenAddConfirmation,
        handleConfirmAdd,
        handleCloseConfirmation,
    } = useFundsExpendituresRecordForm({
        isOpen,
        transactionType,
        categories,
        records,
        exchangeRate,
        onSubmit,
    });

    const modalConfig =
        transactionType === 'income' ? FUNDS_EXPENDITURES_TEXT.MODAL.INCOME : FUNDS_EXPENDITURES_TEXT.MODAL.EXPENSE;

    const reportingYearSelectRef = useRef<HTMLDivElement | null>(null);
    const categorySelectRef = useRef<HTMLDivElement | null>(null);

    const handleReportingYearFieldBlur = (event: FocusEvent<HTMLDivElement>) => {
        if (reportingYearSelectRef.current?.contains(event.relatedTarget as Node | null)) {
            return;
        }

        handleReportingYearBlur();
    };

    const handleCategoryFieldBlur = (event: FocusEvent<HTMLDivElement>) => {
        if (categorySelectRef.current?.contains(event.relatedTarget as Node | null)) {
            return;
        }

        handleCategoryBlur();
    };

    return (
        <>
            <FundsExpendituresRecordModal
                isOpen={isOpen}
                title={modalConfig.TITLE}
                subtitle={modalConfig.SUBTITLE}
                submitButtonLabel={modalConfig.SUBMIT_BUTTON}
                isSubmitDisabled={isSubmitDisabled}
                isDirty={isDirty}
                onSubmit={handleOpenAddConfirmation}
                onClose={onClose}
                closeConfirmationTitle={FUNDS_EXPENDITURES_TEXT.MODAL.SHARED.CONFIRM_CLOSE_TITLE}
            >
                <div className={styles.form}>
                    <div className={styles.field} onBlurCapture={handleReportingYearFieldBlur}>
                        <label className={styles.label}>
                            <span className={styles.required}>*</span>
                            {FUNDS_EXPENDITURES_TEXT.MODAL.SHARED.REPORTING_YEAR_LABEL}
                        </label>
                        <Select<string>
                            value={formState.reportingYear}
                            onValueChange={handleReportingYearChange}
                            selectContainerRef={reportingYearSelectRef}
                            placeholder={FUNDS_EXPENDITURES_TEXT.MODAL.SHARED.REPORTING_YEAR_PLACEHOLDER}
                            className={styles.select}
                            optionClassName={styles['select-option']}
                        >
                            {yearOptions.map((year) => (
                                <Select.Option key={year} value={year} name={year} />
                            ))}
                        </Select>
                        {formState.errors.reportingYear && (
                            <p className={styles.error}>{formState.errors.reportingYear}</p>
                        )}
                    </div>

                    <div className={styles.field} onBlurCapture={handleCategoryFieldBlur}>
                        <label className={styles.label}>
                            <span className={styles.required}>*</span>
                            {modalConfig.CATEGORY_LABEL}
                        </label>
                        {isCategorySelectDisabled ? (
                            <div
                                className={styles['disabled-select-placeholder']}
                                data-testid="record-category-disabled-placeholder"
                            >
                                {FUNDS_EXPENDITURES_TEXT.MODAL.SHARED.CATEGORY_NO_AVAILABLE}
                            </div>
                        ) : (
                            <Select<number>
                                value={formState.categoryId}
                                onValueChange={handleCategoryChange}
                                selectContainerRef={categorySelectRef}
                                placeholder={modalConfig.CATEGORY_PLACEHOLDER}
                                className={styles.select}
                                optionClassName={styles['select-option']}
                            >
                                {filteredCategories.map((category) => (
                                    <Select.Option key={category.id} value={category.id} name={category.name} />
                                ))}
                            </Select>
                        )}
                        {formState.errors.categoryId && <p className={styles.error}>{formState.errors.categoryId}</p>}
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>
                            <span className={styles.required}>*</span>
                            {FUNDS_EXPENDITURES_TEXT.MODAL.SHARED.AMOUNT_UAH_LABEL}
                        </label>
                        <InputWithCharacterLimit
                            id="add-record-amount-uah"
                            name="amountUah"
                            type="text"
                            value={formState.amountUah}
                            onChange={(event) => handleAmountChange(event.target.value)}
                            onBlur={() => handleAmountBlur('amountUah')}
                            maxLength={20}
                            showCounter={false}
                            className={styles.input}
                            hasError={Boolean(formState.errors.amountUah)}
                        />
                        {formState.errors.amountUah && <p className={styles.error}>{formState.errors.amountUah}</p>}
                    </div>

                    <div className={styles.field}>
                        <div className={styles['amount-usd-header']}>
                            <label className={styles.label}>
                                <span className={styles.required}>*</span>
                                {FUNDS_EXPENDITURES_TEXT.MODAL.SHARED.AMOUNT_USD_LABEL}
                            </label>
                            <div className={styles['exchange-rate-chip']}>
                                <span className={styles['exchange-rate-chip-label']}>
                                    {FUNDS_EXPENDITURES_TEXT.EXCHANGE_RATE_LABEL}
                                </span>
                                <input
                                    type="text"
                                    value={exchangeRate ?? ''}
                                    disabled
                                    className={styles['exchange-rate-value']}
                                />
                            </div>
                        </div>
                        <InputWithCharacterLimit
                            id="add-record-amount-usd"
                            name="amountUsd"
                            type="text"
                            value={formState.amountUsd}
                            onChange={(event) => handleUsdChange(event.target.value)}
                            onBlur={() => handleAmountBlur('amountUsd')}
                            maxLength={20}
                            showCounter={false}
                            className={styles.input}
                            hasError={Boolean(formState.errors.amountUsd)}
                        />
                        {formState.errors.amountUsd && <p className={styles.error}>{formState.errors.amountUsd}</p>}
                        {usdMismatchMessage && (
                            <div className={styles.info}>
                                <InfoIcon className={styles['info-icon']} aria-hidden="true" />
                                <p className={styles['info-text']}>{usdMismatchMessage}</p>
                            </div>
                        )}
                    </div>
                </div>
            </FundsExpendituresRecordModal>

            <ConfirmationModal
                isOpen={isAddConfirmationOpen}
                title={modalConfig.CONFIRM_ADD_TITLE}
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
                onConfirm={() => handleConfirmAdd()}
                onCancel={handleCloseConfirmation}
                onClose={handleCloseConfirmation}
                isButtonsDisabled={isSubmitting}
            />
        </>
    );
};
