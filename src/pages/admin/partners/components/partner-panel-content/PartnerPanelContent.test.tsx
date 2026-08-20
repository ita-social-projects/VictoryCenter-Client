import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PartnerPanelContent } from './PartnerPanelContent';
import { PartnerSectionsEditorRef } from '../partner-sections-editor/PartnerSectionsEditor';
import { useLocalizationToolkit } from '@/hooks/admin/use-localization-toolkit/useLocalizationToolkit';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';

const UK_LANGUAGE = { id: 1, code: 'uk', name: 'Ukrainian' };
const EN_LANGUAGE = { id: 2, code: 'en', name: 'English' };

jest.mock('../partner-page-toolbar/PartnerPageToolbar', () => ({
    PartnerPageToolbar: ({ onAddSection, disableAddSection }: any) => (
        <div data-testid="partner-page-toolbar">
            <button onClick={onAddSection} disabled={disableAddSection}>
                Add Section
            </button>
        </div>
    ),
}));

jest.mock('../partner-banner-form/PartnerBannerForm', () => ({
    PartnerBanner: ({ language }: any) => <div data-testid="partner-banner" data-language={language?.code} />,
}));

const mockPartnerSectionsEditor = jest.fn();

jest.mock('../partner-sections-editor/PartnerSectionsEditor', () => {
    const React = require('react');
    return {
        PartnerSectionsEditor: React.forwardRef(({ language }: any, ref: React.Ref<PartnerSectionsEditorRef>) => {
            React.useImperativeHandle(ref, () => ({
                addSection: mockPartnerSectionsEditor,
            }));

            return <div data-testid="partner-sections-editor" data-language={language?.code} />;
        }),
    };
});

jest.mock('@/components/admin/toast/toast-container/ToastContainer', () => ({
    ToastContainer: () => <div data-testid="toast-container" />,
}));

jest.mock('@/contexts/admin/toast-context-provider/ToastContextProvider');
jest.mock('@/hooks/admin/use-localization-toolkit/useLocalizationToolkit');

const mockedUseLocalizationToolkit = useLocalizationToolkit as jest.Mock;
const mockedUseToast = useToast as jest.Mock;

describe('PartnerPanelContent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPartnerSectionsEditor.mockReset();

        mockedUseToast.mockReturnValue({ addToast: jest.fn() });

        mockedUseLocalizationToolkit.mockReturnValue({
            allLanguages: [UK_LANGUAGE, EN_LANGUAGE],
            translationLanguages: [EN_LANGUAGE],
            selectedLanguage: UK_LANGUAGE,
            onLanguageChange: jest.fn(),
            translationStatusFilter: undefined,
            onTranslationStatusFilterChange: jest.fn(),
            retryFetchLanguages: jest.fn(),
        });
    });

    it('renders toolbar, banner, sections editor, and toast container', () => {
        render(<PartnerPanelContent />);

        expect(screen.getByTestId('partner-page-toolbar')).toBeInTheDocument();
        expect(screen.getByTestId('partner-banner')).toHaveAttribute('data-language', 'uk');
        expect(screen.getByTestId('partner-sections-editor')).toHaveAttribute('data-language', 'uk');
        expect(screen.getByTestId('toast-container')).toBeInTheDocument();
    });

    it('triggers addSection on the sections editor when toolbar button is clicked', () => {
        render(<PartnerPanelContent />);

        fireEvent.click(screen.getByText('Add Section'));

        expect(mockPartnerSectionsEditor).toHaveBeenCalledTimes(1);
    });

    it('shows a loader instead of the banner/sections while the language has not been selected yet', () => {
        mockedUseLocalizationToolkit.mockReturnValue({
            allLanguages: [],
            translationLanguages: [],
            selectedLanguage: undefined,
            onLanguageChange: jest.fn(),
            translationStatusFilter: undefined,
            onTranslationStatusFilterChange: jest.fn(),
            retryFetchLanguages: jest.fn(),
        });

        render(<PartnerPanelContent />);

        expect(screen.queryByTestId('partner-banner')).not.toBeInTheDocument();
        expect(screen.queryByTestId('partner-sections-editor')).not.toBeInTheDocument();
    });

    it('disables the add-section toolbar button when a non-base language is selected', () => {
        mockedUseLocalizationToolkit.mockReturnValue({
            allLanguages: [UK_LANGUAGE, EN_LANGUAGE],
            translationLanguages: [EN_LANGUAGE],
            selectedLanguage: EN_LANGUAGE,
            onLanguageChange: jest.fn(),
            translationStatusFilter: undefined,
            onTranslationStatusFilterChange: jest.fn(),
            retryFetchLanguages: jest.fn(),
        });

        render(<PartnerPanelContent />);

        expect(screen.getByText('Add Section')).toBeDisabled();
    });

    it('shows an error with a retry action when languages fail to load, instead of spinning forever', () => {
        const retryFetchLanguages = jest.fn();
        let capturedSetErrorState: (message: string) => void = () => {};

        mockedUseLocalizationToolkit.mockImplementation(({ setErrorState }: any) => {
            capturedSetErrorState = setErrorState;
            return {
                allLanguages: [],
                translationLanguages: [],
                selectedLanguage: undefined,
                onLanguageChange: jest.fn(),
                translationStatusFilter: undefined,
                onTranslationStatusFilterChange: jest.fn(),
                retryFetchLanguages,
            };
        });

        render(<PartnerPanelContent />);

        expect(screen.queryByTestId('partner-banner')).not.toBeInTheDocument();

        act(() => {
            capturedSetErrorState('Failed to load languages');
        });

        expect(screen.getByText('Failed to load languages')).toBeInTheDocument();
        expect(screen.queryByTestId('partner-banner')).not.toBeInTheDocument();

        fireEvent.click(screen.getByText('Спробувати ще раз'));

        expect(retryFetchLanguages).toHaveBeenCalledTimes(1);
        expect(screen.queryByText('Failed to load languages')).not.toBeInTheDocument();
    });
});
