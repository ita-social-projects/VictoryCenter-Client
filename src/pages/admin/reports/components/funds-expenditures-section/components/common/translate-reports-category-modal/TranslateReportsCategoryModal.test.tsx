import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
import { ReportFundsExpendituresCategory } from '@/types/admin/reports';
import { LocalizationLanguage, TranslationStatus } from '@/types/common/language';
import { TranslateReportsCategoryModal } from './TranslateReportsCategoryModal';

jest.mock('@/hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: () => ({ post: jest.fn(), put: jest.fn() }),
}));

jest.mock(
    '@/services/api/admin/reports/report-funds-expenditures-category-localizations/report-funds-expenditures-category-localizations-api',
    () => ({
        ReportFundsExpendituresCategoryLocalizationsApi: {
            create: jest.fn(),
            update: jest.fn(),
        },
    }),
);

jest.mock('@/utils/functions/mappers/common/localization/localization-mappers', () => ({
    mapLocalizationDtoToModel: jest.fn(),
}));

jest.mock('@/components/admin/translation-controls/TranslationControls', () => ({
    TranslationControls: ({ languages, selectedLanguage, onLanguageChange }: any) => (
        <div data-testid="translation-controls">
            {(languages ?? []).map((lang: any) => (
                <button
                    key={lang.id}
                    data-testid={`lang-${lang.code}`}
                    data-selected={String(selectedLanguage?.id === lang.id)}
                    onClick={() => onLanguageChange?.(lang)}
                />
            ))}
        </div>
    ),
}));

jest.mock('@/components/admin/localization-modal/LocalizationModal', () => ({
    LocalizationModal: ({ isOpen, onClose, onSave, title, children }: any) => {
        if (!isOpen) return null;
        return (
            <div data-testid="localization-modal">
                <div data-testid="modal-title">{title}</div>
                <div>{children}</div>
                <button data-testid="modal-close" onClick={onClose} />
                <button data-testid="modal-save" onClick={onSave} />
            </div>
        );
    },
}));

jest.mock('./TranslateReportsCategoryForm', () => {
    const { forwardRef, useImperativeHandle } = jest.requireActual('react');
    const TranslateReportsCategoryForm = forwardRef(
        ({ categories, onCategoryChange, onValidationChange, onSubmit, onDirtyChange }: any, ref: any) => {
            useImperativeHandle(ref, () => ({
                isValid: () => true,
                isDirty: () => true,
                submit: () => onSubmit({ name: 'Translated name' }),
            }));
            return (
                <div data-testid="translate-form">
                    <select
                        data-testid="category-select"
                        onChange={(e) => {
                            const cat = categories.find((c: any) => String(c.id) === e.target.value) ?? null;
                            onCategoryChange?.(cat);
                            onValidationChange?.(!!cat);
                            onDirtyChange?.(!!cat);
                        }}
                    >
                        <option value="">-- select --</option>
                        {categories.map((c: any) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>
            );
        },
    );
    return { TranslateReportsCategoryForm };
});

const languageEn: LocalizationLanguage = { id: 2, code: 'en', name: 'English' };
const languageUk: LocalizationLanguage = { id: 1, code: 'uk', name: 'Українська' };

const categoriesMock: ReportFundsExpendituresCategory[] = [
    { id: 1, name: 'Category One', type: 'income', localizations: [] },
    { id: 2, name: 'Category Two', type: 'expense', localizations: [] },
];

const categoryWithEnTranslation: ReportFundsExpendituresCategory = {
    id: 3,
    name: 'Category Three',
    type: 'income',
    localizations: [
        { language: { id: 2, code: 'en' }, translationStatus: TranslationStatus.Relevant, name: 'Translated Three' },
    ],
};

const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    categories: categoriesMock,
    translatedLanguages: [languageEn, languageUk],
    onTranslateCategory: jest.fn(),
};

describe('TranslateReportsCategoryModal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders modal when isOpen is true', () => {
        render(<TranslateReportsCategoryModal {...defaultProps} />);
        expect(screen.getByTestId('localization-modal')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
        render(<TranslateReportsCategoryModal {...defaultProps} isOpen={false} />);
        expect(screen.queryByTestId('localization-modal')).not.toBeInTheDocument();
    });

    it('shows add-mode title when selected category has no translation for selected language', () => {
        render(<TranslateReportsCategoryModal {...defaultProps} />);
        expect(screen.getByTestId('modal-title')).toHaveTextContent(
            FUNDS_EXPENDITURES_TEXT.MODAL.TRANSLATE_CATEGORY.TITLE,
        );
    });

    it('shows edit-mode title when selected category has an existing translation for selected language', () => {
        render(<TranslateReportsCategoryModal {...defaultProps} categories={[categoryWithEnTranslation]} />);

        fireEvent.change(screen.getByTestId('category-select'), { target: { value: '3' } });

        expect(screen.getByTestId('modal-title')).toHaveTextContent(
            COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.UPDATE_TRANSLATION,
        );
    });

    it('renders TranslationControls with provided languages', () => {
        render(<TranslateReportsCategoryModal {...defaultProps} />);
        expect(screen.getByTestId('translation-controls')).toBeInTheDocument();
        expect(screen.getByTestId('lang-en')).toBeInTheDocument();
        expect(screen.getByTestId('lang-uk')).toBeInTheDocument();
    });

    it('initializes language to first non-default locale', () => {
        render(<TranslateReportsCategoryModal {...defaultProps} />);
        expect(screen.getByTestId('lang-en')).toHaveAttribute('data-selected', 'true');
    });

    it('calls onClose when close button is clicked', () => {
        const onClose = jest.fn();
        render(<TranslateReportsCategoryModal {...defaultProps} onClose={onClose} />);

        fireEvent.click(screen.getByTestId('modal-close'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('renders translate form with categories', () => {
        render(<TranslateReportsCategoryModal {...defaultProps} />);
        expect(screen.getByTestId('translate-form')).toBeInTheDocument();
        expect(screen.getByTestId('category-select')).toBeInTheDocument();
    });

    it('does not render error message by default', () => {
        render(<TranslateReportsCategoryModal {...defaultProps} />);
        expect(screen.queryByText(FUNDS_EXPENDITURES_TEXT.MESSAGE.FAIL_TO_TRANSLATE_CATEGORY)).not.toBeInTheDocument();
    });

    it('resets state when modal is closed and reopened', async () => {
        const { rerender } = render(<TranslateReportsCategoryModal {...defaultProps} />);

        fireEvent.change(screen.getByTestId('category-select'), { target: { value: '1' } });

        fireEvent.click(screen.getByTestId('modal-close'));

        rerender(<TranslateReportsCategoryModal {...defaultProps} isOpen={false} />);
        rerender(<TranslateReportsCategoryModal {...defaultProps} isOpen={true} />);

        await waitFor(() => {
            expect(screen.getByTestId('localization-modal')).toBeInTheDocument();
        });
    });

    it('calls onTranslateCategory when form is submitted successfully', async () => {
        const {
            ReportFundsExpendituresCategoryLocalizationsApi,
        } = require('@/services/api/admin/reports/report-funds-expenditures-category-localizations/report-funds-expenditures-category-localizations-api');
        const {
            mapLocalizationDtoToModel,
        } = require('@/utils/functions/mappers/common/localization/localization-mappers');

        const dtoMock = {
            entityId: 1,
            name: 'Translated name',
            localizationInfoDto: { id: 2, code: 'en' },
            translationStatus: TranslationStatus.Relevant,
        };
        const modelMock = {
            name: 'Translated name',
            language: { id: 2, code: 'en', name: 'English' },
            translationStatus: TranslationStatus.Relevant,
        };

        ReportFundsExpendituresCategoryLocalizationsApi.create.mockResolvedValue(dtoMock);
        mapLocalizationDtoToModel.mockReturnValue(modelMock);

        const onTranslateCategory = jest.fn();
        const onClose = jest.fn();

        render(
            <TranslateReportsCategoryModal
                {...defaultProps}
                onTranslateCategory={onTranslateCategory}
                onClose={onClose}
            />,
        );

        fireEvent.change(screen.getByTestId('category-select'), { target: { value: '1' } });

        fireEvent.click(screen.getByTestId('modal-save'));

        await waitFor(() => expect(onTranslateCategory).toHaveBeenCalled());
        await waitFor(() => expect(onClose).toHaveBeenCalled());
    });

    it('does not initialize language when translatedLanguages is empty', () => {
        render(<TranslateReportsCategoryModal {...defaultProps} translatedLanguages={[]} />);
        expect(screen.getByTestId('translation-controls')).toBeInTheDocument();
    });
});
