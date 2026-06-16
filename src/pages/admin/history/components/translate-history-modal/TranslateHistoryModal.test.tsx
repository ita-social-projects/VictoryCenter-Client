import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TranslateHistoryModal } from './TranslateHistoryModal';
import { HistorySectionDto } from '@/types/common/history-sections';
import { LocalizationLanguage } from '@/types/common/language';
import { ContentType } from '@/types/common/section-contents';

jest.mock('@/components/admin/localization-modal/LocalizationModal', () => ({
    LocalizationModal: ({ children, isOpen, title, onSave, isFormValid }: any) =>
        isOpen ? (
            <div data-testid="localization-modal">
                <h1>{title}</h1>
                <button
                    data-testid="save-btn"
                    disabled={!isFormValid}
                    onClick={() => {
                        onSave();
                    }}
                >
                    Save
                </button>
                {children}
            </div>
        ) : null,
}));

jest.mock('@/components/admin/translation-controls/TranslationControls', () => ({
    TranslationControls: () => <div data-testid="translation-controls" />,
}));

jest.mock('@/hooks/admin/use-translate-history-section/useTranslateHistorySection', () => ({
    useTranslateHistorySection: ({ onSuccess }: any) => ({
        translateSection: jest.fn(async () => {
            onSuccess({ id: 1 });
        }),
        isSubmitting: false,
        error: '',
    }),
}));

const mockSections: HistorySectionDto[] = [
    {
        id: 1,
        template: 1,
        order: 0,
        contents: [
            {
                id: 10,
                sectionId: 1,
                contentType: ContentType.Title,
                title: 'UA Title',
                order: 0,
            },
            {
                id: 11,
                sectionId: 1,
                contentType: ContentType.Description,
                description: 'UA Desc',
                order: 1,
            },
        ],
    },
];

const mockLanguages: LocalizationLanguage[] = [{ id: 1, code: 'en', name: 'English' }];

describe('TranslateHistoryModal', () => {
    const mockOnClose = jest.fn();
    const mockOnSaved = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly when open', () => {
        render(
            <TranslateHistoryModal
                isOpen={true}
                onClose={mockOnClose}
                sections={mockSections}
                languages={mockLanguages}
                onSaved={mockOnSaved}
            />,
        );

        expect(screen.getByTestId('localization-modal')).toBeInTheDocument();
        expect(screen.getByTestId('translation-controls')).toBeInTheDocument();
        expect(screen.getByTestId('translate-history-section-form')).toBeInTheDocument();
    });

    it('saves forms when Save is clicked', async () => {
        const user = userEvent.setup();

        render(
            <TranslateHistoryModal
                isOpen={true}
                onClose={mockOnClose}
                sections={mockSections}
                languages={mockLanguages}
                onSaved={mockOnSaved}
            />,
        );

        const saveBtn = screen.getByTestId('save-btn');
        expect(saveBtn).toBeEnabled();

        await user.click(saveBtn);

        await waitFor(() => {
            expect(mockOnSaved).toHaveBeenCalled();
            expect(mockOnClose).toHaveBeenCalled();
        });
    });
});
