import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import {TeamPageToolbar, TeamPageToolbarProps} from './TeamPageToolbar';

jest.mock('../../../../../assets/icons/plus.svg', () => 'plus-icon.svg');
jest.mock('../../../../../components/common/modal/Modal', () => ({
    Modal: ({children, isOpen, onClose}: any) => (
        isOpen ? (
            <div data-testid="modal" onClick={onClose}>
                {children}
            </div>
        ) : null
    ),
    __esModule: true,
}));

jest.mock('../../../../../components/common/button/Button', () => ({
    Button: ({children, onClick, style, form, type, ...props}: any) => (
        <button
            onClick={onClick}
            data-style={style}
            form={form}
            type={type}
            data-testid={`button-${style}`}
            {...props}
        >
            {children}
        </button>
    ),
}));

jest.mock('../../../../../components/common/select/Select', () => ({
    Select: ({children, onValueChange}: any) => (
        <select data-testid="select" onChange={(e) => onValueChange(e.target.value)}>
            {children}
        </select>
    ),
    __esModule: true,
}));

const SelectMock = jest.requireMock('../../../../../components/common/select/Select').Select;
SelectMock.Option = ({name, value}: any) => (
    <option value={value}>{name}</option>
);

jest.mock('../../../../../components/common/input/Input', () => ({
    Input: ({onChange, autocompleteValues, ...props}: any) => (
        <input
            data-testid="search-input"
            onChange={(e) => onChange(e.target.value)}
            data-autocomplete={JSON.stringify(autocompleteValues)}
            {...props}
        />
    ),
}));

jest.mock('../member-form/MemberForm', () => ({
    MemberForm: ({id, onSubmit, onChange}: any) => (
        <form
            id={id}
            data-testid="member-form"
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit({
                    category: 'TestCategory',
                    fullName: 'Test User',
                    description: 'Test Description',
                    img: null
                });
            }}
        >
            <input
                data-testid="form-input"
                onChange={(e) => onChange && onChange({
                    category: 'TestCategory',
                    fullName: e.target.value,
                    description: 'Test Description',
                    img: null
                })}
            />
            <button type="submit">Submit Form</button>
        </form>
    ),
}));

const MockModal = jest.requireMock('../../../../../components/common/modal/Modal').Modal;
MockModal.Title = ({children}: any) => <h2 data-testid="modal-title">{children}</h2>;
MockModal.Content = ({children}: any) => <div data-testid="modal-content">{children}</div>;
MockModal.Actions = ({children}: any) => <div data-testid="modal-actions">{children}</div>;

describe('TeamPageToolbar', () => {
    const defaultProps: TeamPageToolbarProps = {
        onSearchQueryChange: jest.fn(),
        onStatusFilterChange: jest.fn(),
        autocompleteValues: ['value1', 'value2', 'value3'],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('renders the toolbar with all elements', () => {
            render(<TeamPageToolbar {...defaultProps} />);

            expect(screen.getByTestId('search-input')).toBeInTheDocument();
            expect(screen.getByTestId('select')).toBeInTheDocument();
            expect(screen.getByText('Додати в команду')).toBeInTheDocument();
            expect(screen.getByAltText('plus')).toBeInTheDocument();
        });

        it('passes autocomplete values to input', () => {
            render(<TeamPageToolbar {...defaultProps} />);

            const input = screen.getByTestId('search-input');
            expect(input).toHaveAttribute('data-autocomplete', JSON.stringify(defaultProps.autocompleteValues));
        });

        it('renders select options correctly', () => {
            render(<TeamPageToolbar {...defaultProps} />);

            expect(screen.getByText('Усі')).toBeInTheDocument();
            expect(screen.getByText('Опубліковано')).toBeInTheDocument();
            expect(screen.getByText('Чернетка')).toBeInTheDocument();
        });
    });

    describe('Search functionality', () => {
        it('calls onSearchQueryChange when search input changes', async () => {
            render(<TeamPageToolbar {...defaultProps} />);

            const searchInput = screen.getByTestId('search-input');
            fireEvent.change(searchInput, {target: {value: 'test query'}});

            expect(defaultProps.onSearchQueryChange).toHaveBeenCalledWith('test query');
        });
    });

    describe('Filter functionality', () => {
        it('calls onStatusFilterChange when select value changes', async () => {
            render(<TeamPageToolbar {...defaultProps} />);

            const select = screen.getByTestId('select');
            fireEvent.change(select, {target: {value: 'Опубліковано'}});

            expect(defaultProps.onStatusFilterChange).toHaveBeenCalledWith('Опубліковано');
        });
    });

    describe('Add Team Member Modal', () => {
        it('opens add team member modal when button is clicked', async () => {
            render(<TeamPageToolbar {...defaultProps} />);

            const addButton = screen.getByText('Додати в команду');
            fireEvent.click(addButton);

            expect(screen.getByTestId('modal')).toBeInTheDocument();
            expect(screen.getByTestId('modal-title')).toHaveTextContent("Додати в команду");
            expect(screen.getByTestId('member-form')).toBeInTheDocument();
        });

        it('renders modal actions correctly', async () => {
            render(<TeamPageToolbar {...defaultProps} />);

            const addButton = screen.getByText('Додати в команду');
            fireEvent.click(addButton);

            expect(screen.getByText('Зберегти як чернетку')).toBeInTheDocument();
            expect(screen.getByText('Опублікувати')).toBeInTheDocument();
        });

        it('closes modal when save as draft is clicked', async () => {
            render(<TeamPageToolbar {...defaultProps} />);

            const addButton = screen.getByText('Додати в команду');
            fireEvent.click(addButton);

            const saveAsDraftButton = screen.getByText('Зберегти як чернетку');
            fireEvent.click(saveAsDraftButton);

            expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
        });
    });

    describe('Publish Confirmation Modal', () => {
        it('opens publish confirmation modal when form is submitted', async () => {
            render(<TeamPageToolbar {...defaultProps} />);

            const addButton = screen.getByText('Додати в команду');
            fireEvent.click(addButton);

            const publishButton = screen.getByText('Опублікувати');
            fireEvent.click(publishButton);

            expect(screen.getByText('Опублікувати нового члена команди?')).toBeInTheDocument();
        });

        it('cancels publish when "Ні" is clicked', async () => {
            render(<TeamPageToolbar {...defaultProps} />);

            const addButton = screen.getByText('Додати в команду');
            fireEvent.click(addButton);
            const publishButton = screen.getByText('Опублікувати');
            fireEvent.click(publishButton);

            const cancelButtons = screen.getAllByText('Ні');
            fireEvent.click(cancelButtons[0]);

            expect(screen.queryByText('Опублікувати нового члена команди?')).not.toBeInTheDocument();
        });

        it('confirms publish when "Так" is clicked', async () => {
            render(<TeamPageToolbar {...defaultProps} />);

            const addButton = screen.getByText('Додати в команду');
            fireEvent.click(addButton);
            const publishButton = screen.getByText('Опублікувати');
            fireEvent.click(publishButton);

            const confirmButtons = screen.getAllByText('Так');
            fireEvent.click(confirmButtons[0]);

            expect(screen.queryByText('Опублікувати нового члена команди?')).not.toBeInTheDocument();
            expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
        });
    });

    describe('Close Confirmation Modal', () => {
        it('shows close confirmation modal when trying to close with unsaved changes', async () => {
            render(<TeamPageToolbar {...defaultProps} />);

            const addButton = screen.getByText('Додати в команду');
            fireEvent.click(addButton);

            const modal = screen.getByTestId('modal');
            fireEvent.click(modal);

            expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
        });

        it('closes without confirmation when no changes are made', async () => {
            render(<TeamPageToolbar {...defaultProps} />);

            const addButton = screen.getByText('Додати в команду');
            fireEvent.click(addButton);

            const modal = screen.getByTestId('modal');
            fireEvent.click(modal);

            expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
        });

        it('shows close confirmation modal when there are unsaved changes', async () => {
            const TestComponent = () => {
                const [isConfirmCloseModalOpen, setIsConfirmCloseModalOpen] = React.useState(false);
                const [isAddTeamMemberModalOpen, setIsAddTeamMemberModalOpen] = React.useState(false);
                const [newTeamMemberInfo, setNewTeamMemberInfo] = React.useState<{
                    category: string,
                    fullName: string,
                    description: string,
                    img: string | null
                } | null>({
                    category: 'TestCategory',
                    fullName: 'Test User',
                    description: 'Test Description',
                    img: null
                });

                const handleAddMemberOnClose = () => {
                    if (isAddTeamMemberModalOpen && newTeamMemberInfo !== null) {
                        setIsConfirmCloseModalOpen(true);
                    }
                };

                const handleConfirmClose = () => {
                    if (isAddTeamMemberModalOpen && newTeamMemberInfo != null) {
                        setIsConfirmCloseModalOpen(false);
                        setNewTeamMemberInfo(null);
                        setIsAddTeamMemberModalOpen(false);
                    }
                };

                return (
                    <>
                        <button onClick={() => setIsAddTeamMemberModalOpen(true)}>Open Modal</button>
                        {isAddTeamMemberModalOpen && (
                            <div data-testid="modal" onClick={handleAddMemberOnClose}>
                                <div>Add Member Modal</div>
                            </div>
                        )}
                        {isConfirmCloseModalOpen && (
                            <div data-testid="confirm-close-modal">
                                <div>Зміни буде втрачено. Бажаєте продовжити?</div>
                                <button onClick={() => setIsConfirmCloseModalOpen(false)}>Ні</button>
                                <button onClick={handleConfirmClose}>Так</button>
                            </div>
                        )}
                    </>
                );
            };

            render(<TestComponent/>);

            fireEvent.click(screen.getByText('Open Modal'));
            fireEvent.click(screen.getByTestId('modal'));

            expect(screen.getByTestId('confirm-close-modal')).toBeInTheDocument();
            expect(screen.getByText('Зміни буде втрачено. Бажаєте продовжити?')).toBeInTheDocument();
        });

        it('handles confirm close with unsaved changes', async () => {
            const TestComponent = () => {
                const [isConfirmCloseModalOpen, setIsConfirmCloseModalOpen] = React.useState(false);
                const [isAddTeamMemberModalOpen, setIsAddTeamMemberModalOpen] = React.useState(false);
                const [newTeamMemberInfo, setNewTeamMemberInfo] = React.useState<{
                    category: string,
                    fullName: string,
                    description: string,
                    img: string | null
                } | null>({
                    category: 'TestCategory',
                    fullName: 'Test User',
                    description: 'Test Description',
                    img: null
                });

                const handleAddMemberOnClose = () => {
                    if (isAddTeamMemberModalOpen && newTeamMemberInfo !== null) {
                        setIsConfirmCloseModalOpen(true);
                    }
                };

                const handleConfirmClose = () => {
                    if (isAddTeamMemberModalOpen && newTeamMemberInfo != null) {
                        setIsConfirmCloseModalOpen(false);
                        setNewTeamMemberInfo(null);
                        setIsAddTeamMemberModalOpen(false);
                    }
                };

                return (
                    <>
                        <button onClick={() => setIsAddTeamMemberModalOpen(true)}>Open Modal</button>
                        {isAddTeamMemberModalOpen && (
                            <div data-testid="modal" onClick={handleAddMemberOnClose}>
                                <div>Add Member Modal</div>
                            </div>
                        )}
                        {isConfirmCloseModalOpen && (
                            <div data-testid="confirm-close-modal">
                                <div>Зміни буде втрачено. Бажаєте продовжити?</div>
                                <button onClick={() => setIsConfirmCloseModalOpen(false)}>Ні</button>
                                <button onClick={handleConfirmClose} data-testid="confirm-yes">Так</button>
                            </div>
                        )}
                        <div data-testid="state-display">
                            {isAddTeamMemberModalOpen ? 'Modal Open' : 'Modal Closed'}
                        </div>
                    </>
                );
            };

            render(<TestComponent/>);

            fireEvent.click(screen.getByText('Open Modal'));
            fireEvent.click(screen.getByTestId('modal'));
            fireEvent.click(screen.getByTestId('confirm-yes'));

            expect(screen.getByTestId('state-display')).toHaveTextContent('Modal Closed');
            expect(screen.queryByTestId('confirm-close-modal')).not.toBeInTheDocument();
        });

        it('handles confirm close with empty form data', async () => {
            const TestComponent = () => {
                const [isConfirmCloseModalOpen, setIsConfirmCloseModalOpen] = React.useState(false);
                const [isAddTeamMemberModalOpen, setIsAddTeamMemberModalOpen] = React.useState(false);
                const [newTeamMemberInfo, setNewTeamMemberInfo] = React.useState<{
                    category: string,
                    fullName: string,
                    description: string,
                    img: string | null
                } | null>({
                    category: '',
                    fullName: '',
                    description: '',
                    img: null
                });

                const handleConfirmClose = () => {
                    if (isAddTeamMemberModalOpen && (newTeamMemberInfo === null
                        || (newTeamMemberInfo.img === null
                            && !newTeamMemberInfo.category
                            && !newTeamMemberInfo.fullName
                            && !newTeamMemberInfo.description))) {
                        setNewTeamMemberInfo(null);
                        setIsAddTeamMemberModalOpen(false);
                    }
                };

                return (
                    <>
                        <button onClick={() => setIsAddTeamMemberModalOpen(true)}>Open Modal</button>
                        <button onClick={() => setIsConfirmCloseModalOpen(true)}>Show Confirm</button>
                        {isConfirmCloseModalOpen && (
                            <div data-testid="confirm-close-modal">
                                <button onClick={handleConfirmClose} data-testid="confirm-yes">Так</button>
                            </div>
                        )}
                        <div data-testid="state-display">
                            {isAddTeamMemberModalOpen ? 'Modal Open' : 'Modal Closed'}
                        </div>
                    </>
                );
            };

            render(<TestComponent/>);

            fireEvent.click(screen.getByText('Open Modal'));
            fireEvent.click(screen.getByText('Show Confirm'));
            fireEvent.click(screen.getByTestId('confirm-yes'));

            expect(screen.getByTestId('state-display')).toHaveTextContent('Modal Closed');
        });

        it('cancels close confirmation when "Ні" is clicked', async () => {
            const TestComponent = () => {
                const [isConfirmCloseModalOpen, setIsConfirmCloseModalOpen] = React.useState(true);

                return (
                    <div data-testid="confirm-close-modal">
                        <div>Зміни буде втрачено. Бажаєте продовжити?</div>
                        <button onClick={() => setIsConfirmCloseModalOpen(false)} data-testid="cancel-close">Ні</button>
                        <div data-testid="modal-state">
                            {isConfirmCloseModalOpen ? 'Open' : 'Closed'}
                        </div>
                    </div>
                );
            };

            render(<TestComponent/>);

            fireEvent.click(screen.getByTestId('cancel-close'));
            expect(screen.getByTestId('modal-state')).toHaveTextContent('Closed');
        });
    });

    describe('State Management', () => {
        it('handles multiple modal states correctly', async () => {
            render(<TeamPageToolbar {...defaultProps} />);

            const addButton = screen.getByText('Додати в команду');
            fireEvent.click(addButton);

            const publishButton = screen.getByText('Опублікувати');
            fireEvent.click(publishButton);

            expect(screen.getByText('Додати в команду')).toBeInTheDocument();
            expect(screen.getByText('Опублікувати нового члена команди?')).toBeInTheDocument();
        });

        it('resets state when modals are closed', async () => {
            render(<TeamPageToolbar {...defaultProps} />);

            const addButton = screen.getByText('Додати в команду');
            fireEvent.click(addButton);

            const saveAsDraftButton = screen.getByText('Зберегти як чернетку');
            fireEvent.click(saveAsDraftButton);

            fireEvent.click(addButton);
            expect(screen.getByTestId('member-form')).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('handles rapid modal open/close operations', async () => {
            render(<TeamPageToolbar {...defaultProps} />);

            const addButton = screen.getByText('Додати в команду');

            fireEvent.click(addButton);
            expect(screen.getByTestId('modal')).toBeInTheDocument();

            const saveAsDraftButton = screen.getByText('Зберегти як чернетку');
            fireEvent.click(saveAsDraftButton);
            expect(screen.queryByTestId('modal')).not.toBeInTheDocument();

            fireEvent.click(addButton);
            expect(screen.getByTestId('modal')).toBeInTheDocument();
        });

        it('handles form submission with different member data', async () => {
            render(<TeamPageToolbar {...defaultProps} />);

            const addButton = screen.getByText('Додати в команду');
            fireEvent.click(addButton);

            const form = screen.getByTestId('member-form');
            fireEvent.submit(form);

            expect(screen.getByText('Опублікувати нового члена команди?')).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('has proper button roles and attributes', () => {
            render(<TeamPageToolbar {...defaultProps} />);

            const addButton = screen.getByText('Додати в команду');
            expect(addButton).toHaveAttribute('data-buttonStyle', 'primary');
        });

        it('has proper form attributes for modal form', async () => {
            render(<TeamPageToolbar {...defaultProps} />);

            const addButton = screen.getByText('Додати в команду');
            fireEvent.click(addButton);

            const publishButton = screen.getByText('Опублікувати');
            expect(publishButton).toHaveAttribute('form', 'add-member-modal');
            expect(publishButton).toHaveAttribute('type', 'submit');
        });
    });

    describe('Component Integration', () => {
        it('integrates properly with MemberForm component', async () => {
            render(<TeamPageToolbar {...defaultProps} />);

            const addButton = screen.getByText('Додати в команду');
            fireEvent.click(addButton);

            const memberForm = screen.getByTestId('member-form');
            expect(memberForm).toHaveAttribute('id', 'add-member-modal');
        });

        it('passes correct props to child components', () => {
            render(<TeamPageToolbar {...defaultProps} />);

            const searchInput = screen.getByTestId('search-input');
            expect(searchInput).toHaveAttribute('data-autocomplete', JSON.stringify(defaultProps.autocompleteValues));

            const addButton = screen.getByText('Додати в команду');
            expect(addButton).toHaveAttribute('data-buttonStyle', 'primary');
        });
    });

    describe('handleConfirmClose', () => {
        it('closes modal and resets state when newTeamMemberInfo is empty', async () => {
            render(<TeamPageToolbar {...defaultProps} />);

            const addButton = screen.getByText('Додати в команду');
            fireEvent.click(addButton);

            const modal = screen.getByTestId('modal');
            fireEvent.click(modal);

            expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
        });

        it('closes modal and resets state when newTeamMemberInfo is null', async () => {
            render(<TeamPageToolbar {...defaultProps} />);

            const addButton = screen.getByText('Додати в команду');
            fireEvent.click(addButton);

            const modal = screen.getByTestId('modal');
            fireEvent.click(modal);

            expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
        });
    });
});
