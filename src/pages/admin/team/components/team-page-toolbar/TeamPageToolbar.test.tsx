import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TeamPageToolbar, TeamPageToolbarProps } from './TeamPageToolbar';
import { MemberFormValues } from '../member-form/MemberForm';

// Mock the plus icon
jest.mock('../../../../../assets/icons/plus.svg', () => 'plus-icon.svg');

// Mock the Modal component
jest.mock('../../../../../components/common/modal/Modal', () => {
    const MockModal = ({ children, isOpen, onClose, 'data-testid': testId }: any) => {
        if (!isOpen) return null;

        return (
            <div data-testid={testId} role="dialog">
                <div
                    onClick={onClose}
                    data-testid="modal-backdrop"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            onClose();
                        }
                    }}
                />
                {children}
            </div>
        );
    };

    MockModal.Title = ({ children }: any) => <h2 data-testid="modal-title">{children}</h2>;
    MockModal.Content = ({ children }: any) => <div data-testid="modal-content">{children}</div>;
    MockModal.Actions = ({ children }: any) => <div data-testid="modal-actions">{children}</div>;

    return { Modal: MockModal };
});

// Mock the Button component
jest.mock('../../../../../components/common/button/Button', () => ({
    Button: ({ children, onClick, buttonStyle, form, type, 'data-testid': testId, ...props }: any) => (
        <button
            onClick={onClick}
            data-button-style={buttonStyle}
            data-testid={testId}
            form={form}
            type={type}
            {...props}
        >
            {children}
        </button>
    ),
}));

// Mock the Select component
jest.mock('../../../../../components/common/select/Select', () => {
    const MockSelect = ({ children, onValueChange, 'data-testid': testId }: any) => (
        <select data-testid={testId} onChange={(e) => onValueChange?.(e.target.value)}>
            {children}
        </select>
    );
    MockSelect.Option = ({ name, value }: any) => <option value={value}>{name}</option>;
    return { Select: MockSelect };
});

jest.mock('../../../../../components/admin/search-bar/SearchBar', () => ({
    SearchBar: ({ onChange, autocompleteValues, 'data-testid': testId, ...props }: any) => (
        <input
            data-testid={testId}
            onChange={(e) => onChange?.(e.target.value)}
            data-autocomplete-values={JSON.stringify(autocompleteValues)}
            {...props}
        />
    ),
}));

const mockMemberForm = jest.fn();

jest.mock('../member-form/MemberForm', () => ({
    MemberForm: (props: any) => {
        mockMemberForm(props);

        const defaultData: MemberFormValues = {
            category: {
                id: 1,
                name: 'Основна команда',
                description: 'Test',
            },
            fullName: 'Test User',
            description: 'Test Description',
            image: {
                base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABDQottAAAAABJRU5ErkJggg==',
                mimeType: 'image/png',
                size: 0,
            },
            imageId: 1,
        };

        return (
            <form
                id={props.id}
                data-testid="member-form"
                onSubmit={(e) => {
                    e.preventDefault();
                    props.onSubmit?.(defaultData);
                }}
            >
                <input
                    data-testid="form-fullname"
                    onChange={(e) => {
                        const updatedData = {
                            ...defaultData,
                            fullName: e.target.value,
                        };
                        props.onFormDataChange?.(updatedData);
                        props.onValuesChange?.(updatedData);
                    }}
                />
                <button type="submit" data-testid="form-submit">
                    Submit Form
                </button>
            </form>
        );
    },
}));

describe('TeamPageToolbar', () => {
    const defaultProps: TeamPageToolbarProps = {
        onSearchQueryChange: jest.fn(),
        onStatusFilterChange: jest.fn(),
        autocompleteValues: ['John Doe', 'Jane Smith'],
        onMemberPublish: jest.fn(),
        onMemberSaveDraft: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockMemberForm.mockClear();
    });

    describe('Initial Rendering', () => {
        it('renders all toolbar elements', () => {
            render(<TeamPageToolbar {...defaultProps} />);

            expect(screen.getByTestId('search-input')).toBeInTheDocument();
            expect(screen.getByTestId('status-filter')).toBeInTheDocument();
            expect(screen.getByTestId('add-member-button')).toBeInTheDocument();
            expect(screen.getByText('Додати в команду')).toBeInTheDocument();
        });

        it('renders select options correctly', () => {
            render(<TeamPageToolbar {...defaultProps} />);

            expect(screen.getByText('Усі')).toBeInTheDocument();
            expect(screen.getByText('Опубліковано')).toBeInTheDocument();
            expect(screen.getByText('Чернетка')).toBeInTheDocument();
        });

        it('passes autocomplete values to input', () => {
            render(<TeamPageToolbar {...defaultProps} />);

            const input = screen.getByTestId('search-input');
            expect(input).toHaveAttribute('data-autocomplete-values', JSON.stringify(defaultProps.autocompleteValues));
        });

        it('initially shows no modals', () => {
            render(<TeamPageToolbar {...defaultProps} />);

            expect(screen.queryByTestId('add-member-modal')).not.toBeInTheDocument();
            expect(screen.queryByTestId('publish-confirm-modal')).not.toBeInTheDocument();
            expect(screen.queryByTestId('confirm-close-modal')).not.toBeInTheDocument();
        });
    });

    describe('Search Functionality', () => {
        it('calls onSearchQueryChange when search input changes', async () => {
            render(<TeamPageToolbar {...defaultProps} />);

            const searchInput = screen.getByTestId('search-input');
            await userEvent.type(searchInput, 'test search');

            expect(defaultProps.onSearchQueryChange).toHaveBeenCalledWith('test search');
        });
    });

    describe('Status Filter Functionality', () => {
        it('calls onStatusFilterChange for each filter option', async () => {
            render(<TeamPageToolbar {...defaultProps} />);

            const select = screen.getByTestId('status-filter');

            await userEvent.selectOptions(select, 'Усі');
            expect(defaultProps.onStatusFilterChange).toHaveBeenCalledWith('Усі');

            await userEvent.selectOptions(select, 'Опубліковано');
            expect(defaultProps.onStatusFilterChange).toHaveBeenCalledWith('Опубліковано');

            await userEvent.selectOptions(select, 'Чернетка');
            expect(defaultProps.onStatusFilterChange).toHaveBeenCalledWith('Чернетка');
        });
    });

    describe('Add Member Modal Flow', () => {
        it('opens add member modal when button is clicked', async () => {
            render(<TeamPageToolbar {...defaultProps} />);

            await userEvent.click(screen.getByTestId('add-member-button'));

            expect(screen.getByTestId('add-member-modal')).toBeInTheDocument();
        });

        it('renders add member modal with correct structure', async () => {
            render(<TeamPageToolbar {...defaultProps} />);

            await userEvent.click(screen.getByTestId('add-member-button'));

            expect(screen.getByTestId('add-member-modal')).toBeInTheDocument();
            expect(screen.getByTestId('member-form')).toBeInTheDocument();
            expect(screen.getByText('Зберегти як чернетку')).toBeInTheDocument();
            expect(screen.getByText('Опублікувати')).toBeInTheDocument();
        });

        it('passes correct props to MemberForm', async () => {
            render(<TeamPageToolbar {...defaultProps} />);

            await userEvent.click(screen.getByTestId('add-member-button'));

            expect(mockMemberForm).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 'add-member-modal',
                    onSubmit: expect.any(Function),
                    onValuesChange: expect.any(Function),
                    onError: undefined,
                    isDraft: false,
                }),
            );
        });
    });

    describe('Save as Draft Flow', () => {
        it('saves as draft and closes modal', async () => {
            render(<TeamPageToolbar {...defaultProps} />);

            await userEvent.click(screen.getByTestId('add-member-button'));

            // Simulate form data being present by typing in the form
            const formInput = screen.getByTestId('form-fullname');
            await userEvent.type(formInput, 'Test User');

            // Now click the save as draft button
            await userEvent.click(screen.getByText('Зберегти як чернетку'));

            await waitFor(() => {
                expect(defaultProps.onMemberSaveDraft).toHaveBeenCalledWith(
                    expect.objectContaining({
                        fullName: 'Test User',
                        description: 'Test Description',
                    }),
                );
            });

            await waitFor(() => {
                expect(screen.queryByTestId('add-member-modal')).not.toBeInTheDocument();
            });
        });

        it('reopens modal with clean state after saving draft', async () => {
            render(<TeamPageToolbar {...defaultProps} />);

            await userEvent.click(screen.getByTestId('add-member-button'));

            // Simulate form data being present
            const formInput = screen.getByTestId('form-fullname');
            await userEvent.type(formInput, 'Test User');

            await userEvent.click(screen.getByText('Зберегти як чернетку'));

            await waitFor(() => {
                expect(defaultProps.onMemberSaveDraft).toHaveBeenCalled();
            });

            await waitFor(() => {
                expect(screen.queryByTestId('add-member-modal')).not.toBeInTheDocument();
            });

            await userEvent.click(screen.getByTestId('add-member-button'));
            expect(screen.getByTestId('add-member-modal')).toBeInTheDocument();
        });
    });

    describe('Publish Flow', () => {
        it('opens publish confirmation modal when form is submitted', async () => {
            render(<TeamPageToolbar {...defaultProps} />);

            await userEvent.click(screen.getByTestId('add-member-button'));
            fireEvent.submit(screen.getByTestId('member-form'));

            expect(screen.getByTestId('publish-confirm-modal')).toBeInTheDocument();
            expect(screen.getByText('Опублікувати нового члена команди?')).toBeInTheDocument();
        });

        it('cancels publish confirmation and returns to add member modal', async () => {
            render(<TeamPageToolbar {...defaultProps} />);

            await userEvent.click(screen.getByTestId('add-member-button'));
            fireEvent.submit(screen.getByTestId('member-form'));

            await userEvent.click(screen.getByText('Ні'));

            expect(screen.queryByTestId('publish-confirm-modal')).not.toBeInTheDocument();
            expect(screen.getByTestId('add-member-modal')).toBeInTheDocument();
        });

        it('confirms publish and calls onMemberPublish', async () => {
            render(<TeamPageToolbar {...defaultProps} />);

            await userEvent.click(screen.getByTestId('add-member-button'));
            fireEvent.submit(screen.getByTestId('member-form'));

            await userEvent.click(screen.getByText('Так'));

            expect(defaultProps.onMemberPublish).toHaveBeenCalledWith({
                category: {
                    id: 1,
                    name: 'Основна команда',
                    description: 'Test',
                },
                fullName: 'Test User',
                description: 'Test Description',
                image: {
                    base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABDQottAAAAABJRU5ErkJggg==',
                    mimeType: 'image/png',
                    size: 0,
                },
                imageId: 1,
            });

            expect(screen.queryByTestId('publish-confirm-modal')).not.toBeInTheDocument();
            expect(screen.queryByTestId('add-member-modal')).not.toBeInTheDocument();
        });
    });

    describe('Close Confirmation Flow', () => {
        it('closes modal directly when no unsaved changes', async () => {
            render(<TeamPageToolbar {...defaultProps} />);

            await userEvent.click(screen.getByTestId('add-member-button'));

            const backdrop = screen.getByTestId('modal-backdrop');
            await userEvent.click(backdrop);

            expect(screen.queryByTestId('add-member-modal')).not.toBeInTheDocument();
            expect(screen.queryByTestId('confirm-close-modal')).not.toBeInTheDocument();
        });

        it('detects unsaved changes and shows confirm-close modal when closing', async () => {
            render(<TeamPageToolbar {...defaultProps} />);

            await userEvent.click(screen.getByTestId('add-member-button'));

            // Simulate form data change
            const formInput = screen.getByTestId('form-fullname');
            await userEvent.type(formInput, 'Test');

            const backdrop = screen.getByTestId('modal-backdrop');
            await userEvent.click(backdrop);

            expect(screen.getByTestId('confirm-close-modal')).toBeInTheDocument();
        });

        it('resets state after confirming close without saving', async () => {
            render(<TeamPageToolbar {...defaultProps} />);

            await userEvent.click(screen.getByTestId('add-member-button'));

            // Simulate form data change
            const formInput = screen.getByTestId('form-fullname');
            await userEvent.type(formInput, 'Test');

            const backdrop = screen.getByTestId('modal-backdrop');
            await userEvent.click(backdrop);

            expect(screen.getByTestId('confirm-close-modal')).toBeInTheDocument();

            await userEvent.click(screen.getByText('Так'));

            expect(screen.queryByTestId('add-member-modal')).not.toBeInTheDocument();
            expect(screen.queryByTestId('confirm-close-modal')).not.toBeInTheDocument();
        });

        it('cancels close confirmation and returns to add member modal', async () => {
            render(<TeamPageToolbar {...defaultProps} />);

            await userEvent.click(screen.getByTestId('add-member-button'));

            // Simulate form data change
            const formInput = screen.getByTestId('form-fullname');
            await userEvent.type(formInput, 'Test');

            const backdrop = screen.getByTestId('modal-backdrop');
            await userEvent.click(backdrop);

            expect(screen.getByTestId('confirm-close-modal')).toBeInTheDocument();

            await userEvent.click(screen.getByText('Ні'));

            expect(screen.queryByTestId('confirm-close-modal')).not.toBeInTheDocument();
            expect(screen.getByTestId('add-member-modal')).toBeInTheDocument();
        });
    });

    describe('Complex Scenarios', () => {
        it('handles multiple modal transitions correctly', async () => {
            render(<TeamPageToolbar {...defaultProps} />);

            await userEvent.click(screen.getByTestId('add-member-button'));
            expect(screen.getByTestId('add-member-modal')).toBeInTheDocument();

            fireEvent.submit(screen.getByTestId('member-form'));
            expect(screen.getByTestId('publish-confirm-modal')).toBeInTheDocument();

            await userEvent.click(screen.getByText('Ні'));
            expect(screen.queryByTestId('publish-confirm-modal')).not.toBeInTheDocument();
            expect(screen.getByTestId('add-member-modal')).toBeInTheDocument();

            const formInput = screen.getByTestId('form-fullname');
            await userEvent.type(formInput, 'Test');

            const backdrop = screen.getByTestId('modal-backdrop');
            await userEvent.click(backdrop);

            await waitFor(() => {
                expect(screen.getByTestId('confirm-close-modal')).toBeInTheDocument();
            });
        });

        it('handles rapid state changes without errors', async () => {
            render(<TeamPageToolbar {...defaultProps} />);

            // Rapidly open and close modals
            await userEvent.click(screen.getByTestId('add-member-button'));
            await userEvent.click(screen.getByText('Зберегти як чернетку'));

            await userEvent.click(screen.getByTestId('add-member-button'));
            fireEvent.submit(screen.getByTestId('member-form'));
            await userEvent.click(screen.getByText('Так'));

            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
    });

    describe('Optional Props', () => {
        it('works without optional callback props', () => {
            const minimalProps = {
                onSearchQueryChange: jest.fn(),
                onStatusFilterChange: jest.fn(),
                autocompleteValues: [],
            };

            render(<TeamPageToolbar {...minimalProps} />);

            expect(screen.getByTestId('add-member-button')).toBeInTheDocument();
        });

        it('handles missing callbacks gracefully', async () => {
            const propsWithoutCallbacks = {
                onSearchQueryChange: jest.fn(),
                onStatusFilterChange: jest.fn(),
                autocompleteValues: [],
            };

            render(<TeamPageToolbar {...propsWithoutCallbacks} />);

            await userEvent.click(screen.getByTestId('add-member-button'));

            // Simulate form data change
            const formInput = screen.getByTestId('form-fullname');
            await userEvent.type(formInput, 'Test');

            await userEvent.click(screen.getByText('Зберегти як чернетку'));

            await waitFor(() => {
                expect(screen.queryByTestId('add-member-modal')).not.toBeInTheDocument();
            });
        });
    });

    describe('Edge Cases', () => {
        it('handles empty autocomplete values', () => {
            const props = { ...defaultProps, autocompleteValues: [] };
            render(<TeamPageToolbar {...props} />);

            const input = screen.getByTestId('search-input');
            expect(input).toHaveAttribute('data-autocomplete-values', '[]');
        });

        it('handles form submission with empty data', async () => {
            render(<TeamPageToolbar {...defaultProps} />);

            await userEvent.click(screen.getByTestId('add-member-button'));
            fireEvent.submit(screen.getByTestId('member-form'));

            expect(screen.getByTestId('publish-confirm-modal')).toBeInTheDocument();

            await userEvent.click(screen.getByText('Так'));
            expect(defaultProps.onMemberPublish).toHaveBeenCalled();
        });

        it('does not call onMemberPublish if pendingMemberData is null', async () => {
            const onMemberPublish = jest.fn();
            render(<TeamPageToolbar {...defaultProps} onMemberPublish={onMemberPublish} />);

            expect(onMemberPublish).not.toHaveBeenCalled();
        });
    });

    describe('Form Data Management', () => {
        it('closes modal directly when no form data changes', async () => {
            render(<TeamPageToolbar {...defaultProps} />);

            await userEvent.click(screen.getByTestId('add-member-button'));

            // No changes initially - modal should close directly
            const backdrop = screen.getByTestId('modal-backdrop');
            await userEvent.click(backdrop);

            expect(screen.queryByTestId('confirm-close-modal')).not.toBeInTheDocument();
            expect(screen.queryByTestId('add-member-modal')).not.toBeInTheDocument();
        });

        it('shows confirmation when trying to close with unsaved changes', async () => {
            render(<TeamPageToolbar {...defaultProps} />);

            await userEvent.click(screen.getByTestId('add-member-button'));

            // Simulate form data change by typing in the input
            const formInput = screen.getByTestId('form-fullname');
            await userEvent.type(formInput, 'Test User');

            // Try to close the modal - should show confirmation
            const backdrop = screen.getByTestId('modal-backdrop');
            await userEvent.click(backdrop);

            expect(screen.getByTestId('confirm-close-modal')).toBeInTheDocument();
        });

        it('cancels close confirmation and returns to add member modal', async () => {
            render(<TeamPageToolbar {...defaultProps} />);

            await userEvent.click(screen.getByTestId('add-member-button'));

            // Simulate form data change
            const formInput = screen.getByTestId('form-fullname');
            await userEvent.type(formInput, 'Test User');

            // Try to close - should show confirmation
            const backdrop = screen.getByTestId('modal-backdrop');
            await userEvent.click(backdrop);

            expect(screen.getByTestId('confirm-close-modal')).toBeInTheDocument();

            // Cancel the close confirmation
            await userEvent.click(screen.getByText('Ні'));

            expect(screen.queryByTestId('confirm-close-modal')).not.toBeInTheDocument();
            expect(screen.getByTestId('add-member-modal')).toBeInTheDocument();
        });

        it('confirms close and resets state', async () => {
            render(<TeamPageToolbar {...defaultProps} />);

            await userEvent.click(screen.getByTestId('add-member-button'));

            // Simulate form data change
            const formInput = screen.getByTestId('form-fullname');
            await userEvent.type(formInput, 'Test User');

            // Try to close - should show confirmation
            const backdrop = screen.getByTestId('modal-backdrop');
            await userEvent.click(backdrop);

            expect(screen.getByTestId('confirm-close-modal')).toBeInTheDocument();

            // Confirm the close
            await userEvent.click(screen.getByText('Так'));

            expect(screen.queryByTestId('confirm-close-modal')).not.toBeInTheDocument();
            expect(screen.queryByTestId('add-member-modal')).not.toBeInTheDocument();
        });
    });
});
