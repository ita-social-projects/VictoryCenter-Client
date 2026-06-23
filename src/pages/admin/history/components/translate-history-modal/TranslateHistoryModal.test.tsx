import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TranslateHistoryModal } from './TranslateHistoryModal';
import { HistorySectionDto } from '@/types/common/history-sections';
import { LocalizationLanguage } from '@/types/common/language';
import { ContentType } from '@/types/common/section-contents';
import { HISTORY_TRANSLATION_VALIDATION } from '@/validation/admin/history-translation-schema/history-translation-schema';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

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
        translateSections: jest.fn(async () => {
            onSuccess([{ id: 1 }]);
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
                localizations: [],
            },
            {
                id: 11,
                sectionId: 1,
                contentType: ContentType.Description,
                description: 'UA Desc',
                order: 1,
                localizations: [],
            },
        ],
    },
];

const mockLanguages: LocalizationLanguage[] = [{ id: 1, code: 'en', name: 'English' }];

const renderModal = () =>
    render(
        <TranslateHistoryModal
            isOpen={true}
            onClose={mockOnClose}
            sections={mockSections}
            languages={mockLanguages}
            onSaved={mockOnSaved}
        />,
    );

const mockOnClose = jest.fn();
const mockOnSaved = jest.fn();

describe('TranslateHistoryModal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly when open', () => {
        renderModal();

        expect(screen.getByTestId('localization-modal')).toBeInTheDocument();
        expect(screen.getByTestId('translation-controls')).toBeInTheDocument();
        expect(screen.getByTestId('translate-history-section-form')).toBeInTheDocument();
    });

    it('saves forms when Save is clicked with valid data', async () => {
        const user = userEvent.setup();
        renderModal();

        const titleInput = screen.getByRole('textbox', { name: /заголовок/i });
        const descriptionInput = screen.getByRole('textbox', { name: /опис/i });

        await user.click(titleInput);
        await user.paste('Valid title for history');
        await user.tab();

        await user.click(descriptionInput);
        await user.paste('Valid description that meets the minimum length requirement');
        await user.tab();

        const saveBtn = screen.getByTestId('save-btn');
        expect(saveBtn).toBeEnabled();

        await user.click(saveBtn);

        await waitFor(() => {
            expect(mockOnSaved).toHaveBeenCalled();
            expect(mockOnClose).toHaveBeenCalled();
        });
    });

    describe('Validation — on-blur (required + min + max)', () => {
        it('shows required error for title after blur with empty value', async () => {
            const user = userEvent.setup();
            renderModal();

            const titleInput = screen.getByRole('textbox', { name: /заголовок/i });
            await user.click(titleInput);
            await user.tab();

            await waitFor(() => {
                expect(screen.getByText(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED)).toBeInTheDocument();
            });
        });

        it('shows required error for title after blur with only spaces', async () => {
            const user = userEvent.setup();
            renderModal();

            const titleInput = screen.getByRole('textbox', { name: /заголовок/i });
            await user.type(titleInput, '   ');
            await user.tab();

            await waitFor(() => {
                expect(screen.getAllByText(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED).length).toBeGreaterThan(
                    0,
                );
            });
        });

        it('shows min-length error for title after blur when value is too short', async () => {
            const user = userEvent.setup();
            renderModal();

            const titleInput = screen.getByRole('textbox', { name: /заголовок/i });
            await user.type(titleInput, 'Hi');
            await user.tab();

            await waitFor(() => {
                expect(
                    screen.getByText(
                        COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(HISTORY_TRANSLATION_VALIDATION.title.min),
                    ),
                ).toBeInTheDocument();
            });
        });

        it('shows required error for description after blur with empty value', async () => {
            const user = userEvent.setup();
            renderModal();

            const descInput = screen.getByRole('textbox', { name: /опис/i });
            await user.click(descInput);
            await user.tab();

            await waitFor(() => {
                expect(screen.getAllByText(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED).length).toBeGreaterThan(
                    0,
                );
            });
        });

        it('shows min-length error for description after blur when value is too short', async () => {
            const user = userEvent.setup();
            renderModal();

            const descInput = screen.getByRole('textbox', { name: /опис/i });
            await user.type(descInput, 'Short');
            await user.tab();

            await waitFor(() => {
                expect(
                    screen.getByText(
                        COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(
                            HISTORY_TRANSLATION_VALIDATION.description.min,
                        ),
                    ),
                ).toBeInTheDocument();
            });
        });
    });

    describe('Validation — real-time (max-length only)', () => {
        it('caps title value at max characters via native maxlength (no typing beyond limit)', async () => {
            const user = userEvent.setup();
            renderModal();

            const titleInput = screen.getByRole('textbox', { name: /заголовок/i }) as HTMLInputElement;
            const overLimitTitle = 'a'.repeat(HISTORY_TRANSLATION_VALIDATION.title.max + 5);
            await user.click(titleInput);
            await user.paste(overLimitTitle);

            await waitFor(() => {
                expect(titleInput.value.length).toBeLessThanOrEqual(HISTORY_TRANSLATION_VALIDATION.title.max);
            });
        });

        it('does not show min-length or required error while typing (before blur)', async () => {
            const user = userEvent.setup();
            renderModal();

            const titleInput = screen.getByRole('textbox', { name: /заголовок/i });
            await user.type(titleInput, 'Hi');
            expect(screen.queryByText(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED)).not.toBeInTheDocument();
            expect(
                screen.queryByText(
                    COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(HISTORY_TRANSLATION_VALIDATION.title.min),
                ),
            ).not.toBeInTheDocument();
        });
    });

    describe('Space management', () => {
        const testCases = [
            { name: 'strips leading spaces in real-time', input: '   Hello', expected: 'Hello', tab: false },
            { name: 'collapses consecutive spaces into a single space in real-time', input: 'Hello  World', expected: 'Hello World', tab: false },
            { name: 'trims trailing spaces on blur', input: 'Hello   ', expected: 'Hello', tab: true },
        ];

        it.each(testCases)('$name', async ({ input, expected, tab }) => {
            const user = userEvent.setup();
            renderModal();

            const titleInput = screen.getByRole('textbox', { name: /заголовок/i }) as HTMLInputElement;
            await user.type(titleInput, input);

            if (tab) {
                await user.tab();
            }

            await waitFor(() => {
                expect(titleInput.value).toBe(expected);
            });
        });
    });

    describe('Edge Cases', () => {
        it('renders forms correctly even if no language is selected initially', () => {
            render(
                <TranslateHistoryModal
                    isOpen={true}
                    onClose={mockOnClose}
                    sections={mockSections}
                    languages={[]}
                    onSaved={mockOnSaved}
                />,
            );
            expect(screen.getByTestId('translate-history-section-form')).toBeInTheDocument();
        });

        it('does not crash if a section is completely empty without contents', () => {
            const emptySection: HistorySectionDto = { id: 2, template: 1, order: 1, contents: [] };
            render(
                <TranslateHistoryModal
                    isOpen={true}
                    onClose={mockOnClose}
                    sections={[emptySection]}
                    languages={mockLanguages}
                    onSaved={mockOnSaved}
                />,
            );
            expect(screen.getByTestId('translate-history-section-form')).toBeInTheDocument();
        });
    });
});
